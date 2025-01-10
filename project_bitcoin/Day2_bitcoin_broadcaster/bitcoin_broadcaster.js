const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');
const ECPair = require('ecpair').ECPairFactory(require('tiny-secp256k1'));

class BitcoinBroadcaster {
    constructor(network = 'testnet') {
        this.baseUrl = network === 'testnet' 
            ? 'https://blockstream.info/testnet/api'
            : 'https://blockstream.info/api';
        this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    }

    generateNewAddress() {
        const keyPair = ECPair.makeRandom({ network: this.network });
        const { address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network: this.network,
        });
        
        return {
            address,
            privateKey: keyPair.toWIF(),
        };
    }

    async getAddressUtxos(address) {
        try {
            console.log(`Fetching UTXOs for address: ${address}`);
            const response = await axios.get(`${this.baseUrl}/address/${address}/utxo`);
            console.log('UTXOs found:', response.data);
            return response.data;
        } catch (error) {
            console.error('UTXO fetch error details:', error.response?.data || error.message);
            throw new Error(`Error fetching UTXO data: ${error.message}`);
        }
    }

    async createTransaction(sourceAddress, destinationAddress, amountBTC, privateKeyWIF) {
        try {
            console.log('Creating transaction with params:', {
                sourceAddress,
                destinationAddress,
                amountBTC
            });

            // Convert BTC to satoshis
            const amountSats = Math.floor(amountBTC * 100000000);
            
            // Fetch UTXOs
            const utxos = await this.getAddressUtxos(sourceAddress);
            
            if (!utxos || utxos.length === 0) {
                throw new Error('No UTXOs found for the source address');
            }

            // Create transaction
            const psbt = new bitcoin.Psbt({ network: this.network });
            
            // Add inputs
            let totalInput = 0;
            utxos.forEach(utxo => {
                psbt.addInput({
                    hash: utxo.txid,
                    index: utxo.vout,
                    witnessUtxo: {
                        script: Buffer.from(utxo.scriptpubkey, 'hex'),
                        value: utxo.value
                    }
                });
                totalInput += utxo.value;
            });

            // Calculate fee (simplified fee calculation)
            const fee = 1000; // 1000 satoshis as example fee
            
            // Add outputs
            psbt.addOutput({
                address: destinationAddress,
                value: amountSats
            });

            // Add change output if necessary
            const change = totalInput - amountSats - fee;
            if (change > 546) { // dust threshold
                psbt.addOutput({
                    address: sourceAddress,
                    value: change
                });
            }

            // Sign transaction
            const keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF, this.network);
            psbt.signAllInputs(keyPair);
            psbt.finalizeAllInputs();

            return psbt.extractTransaction().toHex();
        } catch (error) {
            console.error('Transaction creation error:', error);
            throw new Error(`Error creating transaction: ${error.message}`);
        }
    }

    async broadcastTransaction(txHex) {
        try {
            console.log('Broadcasting transaction:', txHex);
            const response = await axios.post(`${this.baseUrl}/tx`, txHex);
            console.log('Broadcast response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Broadcast error details:', error.response?.data || error.message);
            throw new Error(`Error broadcasting transaction: ${error.message}`);
        }
    }

    async main() {
        try {
            // Use your actual mainnet addresses and amount here
            const sourceAddress = '1CBBJnFJj5xqdyZRQck479k99gUvTmbkPK';  // The address that has your funds
            const sourcePrivateKey = 'KwDmi2FWcSQno9GiMocbGKbQy54n4UFBCmF82y4m6EMhx5LTJH1J';  // Private key of source address
            const destinationAddress = '1FMxMHP44vpS5TaNZaWpeTJwfFiPyFwwrN';  // Where you want to send the funds
            const amountBTC = 0.0001; // Amount to send in BTC

            console.log('\nStarting mainnet transaction process...');
            console.log(`From: ${sourceAddress}`);
            console.log(`To: ${destinationAddress}`);
            console.log(`Amount: ${amountBTC} BTC`);
            
            const txHex = await this.createTransaction(
                sourceAddress,
                destinationAddress,
                amountBTC,
                sourcePrivateKey
            );
            
            console.log('Transaction created, broadcasting to mainnet...');
            const txid = await this.broadcastTransaction(txHex);
            console.log('Transaction broadcast successful!');
            console.log('TXID:', txid);
            console.log('View transaction: https://blockstream.info/tx/' + txid);
        } catch (error) {
            console.error('Main process error:', error.message);
        }
    }
}

// Example usage
if (require.main === module) {
    const broadcaster = new BitcoinBroadcaster('mainnet');
    broadcaster.main().catch(console.error);
}

module.exports = BitcoinBroadcaster;