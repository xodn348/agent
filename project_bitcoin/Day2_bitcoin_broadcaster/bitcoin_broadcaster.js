const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');

class BitcoinBroadcaster {
    constructor(network = 'testnet') {
        this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
        this.apiUrl = network === 'testnet' 
            ? 'https://blockstream.info/testnet/api'
            : 'https://blockstream.info/api';
    }

    async createTransaction(inputs, outputs, feeRate = 10) {
        try {
            const psbt = new bitcoin.Psbt({ network: this.network });

            // Add inputs
            for (const input of inputs) {
                const utxoData = await this.getUtxoData(input.txid, input.vout);
                psbt.addInput({
                    hash: input.txid,
                    index: input.vout,
                    sequence: 0xffffffff,
                    witnessUtxo: {
                        script: Buffer.from(utxoData.scriptPubKey, 'hex'),
                        value: utxoData.value,
                    },
                });
            }

            // Add outputs
            for (const output of outputs) {
                psbt.addOutput({
                    address: output.address,
                    value: output.value,
                });
            }

            return psbt;
        } catch (error) {
            throw new Error(`Error creating transaction: ${error.message}`);
        }
    }

    async getUtxoData(txid, vout) {
        try {
            const response = await axios.get(`${this.apiUrl}/tx/${txid}`);
            const tx = response.data;
            return tx.vout[vout];
        } catch (error) {
            throw new Error(`Error fetching UTXO data: ${error.message}`);
        }
    }

    async signTransaction(psbt, privateKey) {
        try {
            const keyPair = bitcoin.ECPair.fromWIF(privateKey, this.network);
            
            // Sign all inputs
            for (let i = 0; i < psbt.inputCount; i++) {
                psbt.signInput(i, keyPair);
            }

            // Finalize all inputs
            for (let i = 0; i < psbt.inputCount; i++) {
                psbt.finalizeInput(i);
            }

            return psbt;
        } catch (error) {
            throw new Error(`Error signing transaction: ${error.message}`);
        }
    }

    async broadcast(psbt) {
        try {
            const tx = psbt.extractTransaction();
            const txHex = tx.toHex();

            // Broadcast to network
            const response = await axios.post(
                `${this.apiUrl}/tx`,
                txHex,
                {
                    headers: { 'Content-Type': 'text/plain' }
                }
            );

            return {
                success: true,
                txid: tx.getId(),
                response: response.data
            };
        } catch (error) {
            throw new Error(`Error broadcasting transaction: ${error.message}`);
        }
    }

    async verifyTransaction(txid) {
        try {
            const response = await axios.get(`${this.apiUrl}/tx/${txid}`);
            return {
                confirmed: response.data.status.confirmed,
                blockHeight: response.data.status.block_height,
                blockHash: response.data.status.block_hash,
                confirmations: response.data.status.block_height ? 
                    await this.getConfirmations(response.data.status.block_height) : 0
            };
        } catch (error) {
            throw new Error(`Error verifying transaction: ${error.message}`);
        }
    }

    async getConfirmations(blockHeight) {
        try {
            const tipResponse = await axios.get(`${this.apiUrl}/blocks/tip/height`);
            const currentHeight = tipResponse.data;
            return currentHeight - blockHeight + 1;
        } catch (error) {
            throw new Error(`Error getting confirmations: ${error.message}`);
        }
    }

    async displayTransactionDetails(txid) {
        try {
            console.log('\nTransaction Details:');
            console.log('===================');
            console.log(`TXID: ${txid}`);

            const status = await this.verifyTransaction(txid);
            console.log('\nStatus:');
            console.log(`Confirmed: ${status.confirmed}`);
            if (status.confirmed) {
                console.log(`Block Height: ${status.blockHeight}`);
                console.log(`Block Hash: ${status.blockHash}`);
                console.log(`Confirmations: ${status.confirmations}`);
            }

            return status;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

// Example usage
async function main() {
    const broadcaster = new BitcoinBroadcaster('testnet');
    
    // Example transaction parameters
    const inputs = [{
        txid: 'previous_transaction_id',
        vout: 0
    }];
    
    const outputs = [{
        address: 'recipient_address',
        value: 50000 // in satoshis
    }];

    try {
        // Create and sign transaction
        const psbt = await broadcaster.createTransaction(inputs, outputs);
        const signedPsbt = await broadcaster.signTransaction(psbt, 'your_private_key');
        
        // Broadcast transaction
        const result = await broadcaster.broadcast(signedPsbt);
        console.log('Transaction broadcast result:', result);
        
        // Verify transaction
        if (result.success) {
            await broadcaster.displayTransactionDetails(result.txid);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinBroadcaster;