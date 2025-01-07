const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');

class BitcoinUTXOMultisig {
    constructor(network = 'testnet') {
        this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
        this.baseUrl = network === 'testnet' 
            ? 'https://blockstream.info/testnet/api'
            : 'https://blockstream.info/api';
    }

    async getAddressUTXOs(address) {
        try {
            const response = await axios.get(`${this.baseUrl}/address/${address}/utxo`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching UTXOs: ${error.message}`);
        }
    }

    async createMultisigAddress(publicKeys, m) {
        try {
            const pubkeys = publicKeys.map(hex => Buffer.from(hex, 'hex'));
            
            // Create P2MS output script
            const multisig = bitcoin.payments.p2ms({
                m,
                pubkeys,
                network: this.network
            });

            // Wrap in P2SH
            const p2sh = bitcoin.payments.p2sh({
                redeem: multisig,
                network: this.network
            });

            return {
                address: p2sh.address,
                redeemScript: p2sh.redeem.output.toString('hex'),
                witnessScript: p2sh.redeem.output.toString('hex')
            };
        } catch (error) {
            throw new Error(`Error creating multisig address: ${error.message}`);
        }
    }

    async createMultisigTransaction(utxos, outputs, redeemScript, privateKeys) {
        try {
            const psbt = new bitcoin.Psbt({ network: this.network });

            // Add inputs
            for (const utxo of utxos) {
                psbt.addInput({
                    hash: utxo.txid,
                    index: utxo.vout,
                    witnessScript: Buffer.from(redeemScript, 'hex'),
                    redeemScript: Buffer.from(redeemScript, 'hex'),
                    nonWitnessUtxo: await this.getTransactionHex(utxo.txid)
                });
            }

            // Add outputs
            for (const output of outputs) {
                psbt.addOutput({
                    address: output.address,
                    value: output.value
                });
            }

            // Sign with provided private keys
            privateKeys.forEach(wif => {
                const keyPair = bitcoin.ECPair.fromWIF(wif, this.network);
                psbt.signAllInputs(keyPair);
            });

            // Finalize and build
            psbt.finalizeAllInputs();
            const tx = psbt.extractTransaction();

            return {
                txHex: tx.toHex(),
                txId: tx.getId()
            };
        } catch (error) {
            throw new Error(`Error creating multisig transaction: ${error.message}`);
        }
    }

    async getTransactionHex(txid) {
        try {
            const response = await axios.get(`${this.baseUrl}/tx/${txid}/hex`);
            return Buffer.from(response.data, 'hex');
        } catch (error) {
            throw new Error(`Error fetching transaction hex: ${error.message}`);
        }
    }

    async broadcastTransaction(txHex) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/tx`,
                txHex,
                {
                    headers: { 'Content-Type': 'text/plain' }
                }
            );
            return response.data; // txid
        } catch (error) {
            throw new Error(`Error broadcasting transaction: ${error.message}`);
        }
    }

    async selectOptimalUTXOs(address, targetAmount) {
        try {
            const utxos = await this.getAddressUTXOs(address);
            
            // Sort UTXOs by value
            utxos.sort((a, b) => b.value - a.value);

            let selectedUtxos = [];
            let totalValue = 0;

            // Simple selection strategy - could be improved
            for (const utxo of utxos) {
                selectedUtxos.push(utxo);
                totalValue += utxo.value;

                if (totalValue >= targetAmount) {
                    break;
                }
            }

            if (totalValue < targetAmount) {
                throw new Error('Insufficient funds');
            }

            return {
                utxos: selectedUtxos,
                total: totalValue,
                change: totalValue - targetAmount
            };
        } catch (error) {
            throw new Error(`Error selecting UTXOs: ${error.message}`);
        }
    }

    estimateMultisigSize(inputCount, outputCount, m, n) {
        // Rough size estimation for P2SH multisig
        const baseSize = 10; // Version + locktime
        const inputSize = 180 + (73 * m); // Base input size + signatures
        const outputSize = 34; // P2PKH output

        return baseSize + (inputSize * inputCount) + (outputSize * outputCount);
    }

    async displayUTXOSet(address) {
        try {
            const utxos = await this.getAddressUTXOs(address);
            
            console.log('\nUTXO Set for Address:', address);
            console.log('==========================');
            
            let total = 0;
            utxos.forEach((utxo, index) => {
                console.log(`\nUTXO #${index + 1}:`);
                console.log(`TXID: ${utxo.txid}`);
                console.log(`Output Index: ${utxo.vout}`);
                console.log(`Amount: ${utxo.value} satoshis`);
                total += utxo.value;
            });

            console.log('\nTotal Balance:', total, 'satoshis');
            console.log('            ', total / 100000000, 'BTC');

            return utxos;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

// Example usage
async function main() {
    const manager = new BitcoinUTXOMultisig('testnet');

    try {
        // Create 2-of-3 multisig
        const publicKeys = [
            'public_key_1',
            'public_key_2',
            'public_key_3'
        ];
        
        const multisigAddress = await manager.createMultisigAddress(publicKeys, 2);
        console.log('\nMultisig Address:', multisigAddress);

        // Display UTXOs
        await manager.displayUTXOSet(multisigAddress.address);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinUTXOMultisig;