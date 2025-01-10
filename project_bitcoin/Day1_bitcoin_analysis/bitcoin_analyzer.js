const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');
const readline = require('readline');

class BitcoinAnalyzer {
    constructor(network = 'testnet') {
        this.baseUrl = network === 'testnet' 
            ? 'https://blockstream.info/testnet/api'
            : 'https://blockstream.info/api';
        this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    }

    async getAddressInfo(address) {
        try {
            const [balance, history, utxos] = await Promise.all([
                this.getAddressBalance(address),
                this.getTransactionHistory(address),
                this.getAddressUtxos(address)
            ]);

            return {
                address,
                balance,
                transactionCount: history.length,
                utxoCount: utxos.length,
                transactions: history,
                utxos
            };
        } catch (error) {
            throw new Error(`Error getting address info: ${error.message}`);
        }
    }

    async getAddressBalance(address) {
        try {
            const utxos = await this.getAddressUtxos(address);
            const balanceSats = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
            return {
                satoshis: balanceSats,
                btc: this.formatBitcoin(balanceSats),
                utxoCount: utxos.length
            };
        } catch (error) {
            throw new Error(`Error fetching balance: ${error.message}`);
        }
    }

    async getAddressUtxos(address) {
        try {
            const response = await axios.get(`${this.baseUrl}/address/${address}/utxo`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching UTXOs: ${error.message}`);
        }
    }

    async getTransactionHistory(address) {
        try {
            const response = await axios.get(`${this.baseUrl}/address/${address}/txs`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching transaction history: ${error.message}`);
        }
    }

    async analyzeTx(txid) {
        try {
            const tx = await this.fetchTransaction(txid);
            return this.parseTransaction(tx);
        } catch (error) {
            throw new Error(`Error analyzing transaction: ${error.message}`);
        }
    }

    async fetchTransaction(txid) {
        try {
            const response = await axios.get(`${this.baseUrl}/tx/${txid}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching transaction: ${error.message}`);
        }
    }

    parseTransaction(tx) {
        const analysis = {
            txid: tx.txid,
            version: tx.version,
            size: tx.size,
            weight: tx.weight,
            locktime: tx.locktime,
            fee: tx.fee,
            status: {
                confirmed: tx.status.confirmed,
                block_height: tx.status.block_height,
                block_time: tx.status.block_time,
            },
            inputs: this.parseInputs(tx.vin),
            outputs: this.parseOutputs(tx.vout),
            totalInput: this.calculateTotalInput(tx.vin),
            totalOutput: this.calculateTotalOutput(tx.vout),
        };

        analysis.feeSatPerByte = analysis.fee / analysis.size;
        analysis.feeSatPerWeight = analysis.fee / analysis.weight;
        return analysis;
    }

    parseInputs(inputs) {
        return inputs.map(input => ({
            txid: input.txid,
            vout: input.vout,
            sequence: input.sequence,
            scriptSig: input.scriptSig?.hex,
            witness: input.witness,
            prevout: input.prevout,
            value: input.prevout?.value || 0
        }));
    }

    parseOutputs(outputs) {
        return outputs.map(output => ({
            value: output.value,
            scriptPubKey: output.scriptpubkey,
            type: output.scriptpubkey_type,
            address: output.scriptpubkey_address,
        }));
    }

    calculateTotalInput(inputs) {
        return inputs.reduce((total, input) => total + (input.prevout?.value || 0), 0);
    }

    calculateTotalOutput(outputs) {
        return outputs.reduce((total, output) => total + output.value, 0);
    }

    formatBitcoin(satoshis) {
        return (satoshis / 100000000).toFixed(8);
    }

    async displayAnalysis(txid) {
        try {
            const analysis = await this.analyzeTx(txid);
            
            console.log('\nTransaction Analysis:');
            console.log('========================================');
            console.log(`TXID: ${analysis.txid}`);
            console.log(`Status: ${analysis.status.confirmed ? 'Confirmed' : 'Unconfirmed'}`);
            if (analysis.status.confirmed) {
                console.log(`Block Height: ${analysis.status.block_height}`);
                console.log(`Block Time: ${new Date(analysis.status.block_time * 1000).toUTCString()}`);
            }
            console.log(`Version: ${analysis.version}`);
            console.log(`Size: ${analysis.size} bytes`);
            console.log(`Weight: ${analysis.weight}`);
            console.log(`Locktime: ${analysis.locktime}`);
            console.log(`Fee: ${this.formatBitcoin(analysis.fee)} BTC`);
            console.log(`Fee Rate: ${analysis.feeSatPerByte.toFixed(2)} sat/byte`);
            console.log(`Fee Rate (Weight): ${analysis.feeSatPerWeight.toFixed(2)} sat/weight unit`);
            
            console.log(`\nInputs: ${analysis.inputs.length}`);
            analysis.inputs.forEach((input, index) => {
                console.log(`  Input #${index + 1}:`);
                console.log(`    Previous TX: ${input.txid}`);
                console.log(`    Output Index: ${input.vout}`);
                console.log(`    Value: ${this.formatBitcoin(input.value)} BTC`);
            });
            console.log(`Total Input: ${this.formatBitcoin(analysis.totalInput)} BTC`);
            
            console.log(`\nOutputs: ${analysis.outputs.length}`);
            analysis.outputs.forEach((output, index) => {
                console.log(`  Output #${index + 1}:`);
                console.log(`    Address: ${output.address}`);
                console.log(`    Value: ${this.formatBitcoin(output.value)} BTC`);
                console.log(`    Type: ${output.type}`);
            });
            console.log(`Total Output: ${this.formatBitcoin(analysis.totalOutput)} BTC`);
            
            return analysis;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    static async prompt() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (query) => new Promise((resolve) => rl.question(query, resolve));

        try {
            console.log('\nBitcoin Analyzer Menu:');
            console.log('1. Analyze Transaction');
            console.log('2. Analyze Address');
            console.log('3. Exit');

            const choice = await question('\nEnter your choice (1-3): ');

            const analyzer = new BitcoinAnalyzer('mainnet');

            switch (choice) {
                case '1':
                    const txid = await question('Enter transaction ID: ');
                    await analyzer.displayAnalysis(txid);
                    break;

                case '2':
                    const address = await question('Enter Bitcoin address: ');
                    const addressInfo = await analyzer.getAddressInfo(address);
                    console.log('\nAddress Analysis:');
                    console.log('========================================');
                    console.log(`Address: ${addressInfo.address}`);
                    console.log(`Balance: ${addressInfo.balance.btc} BTC`);
                    console.log(`Transaction Count: ${addressInfo.transactionCount}`);
                    console.log(`UTXO Count: ${addressInfo.utxoCount}`);

                    const showTxs = await question('\nShow recent transactions? (y/n): ');
                    if (showTxs.toLowerCase() === 'y') {
                        console.log('\nRecent Transactions:');
                        addressInfo.transactions.slice(0, 5).forEach((tx, index) => {
                            console.log(`\nTransaction #${index + 1}:`);
                            console.log(`TXID: ${tx.txid}`);
                            console.log(`Confirmed: ${tx.status.confirmed}`);
                            if (tx.status.confirmed) {
                                console.log(`Block Height: ${tx.status.block_height}`);
                                console.log(`Block Time: ${new Date(tx.status.block_time * 1000).toUTCString()}`);
                            }
                        });
                    }
                    break;

                case '3':
                    console.log('Exiting...');
                    break;

                default:
                    console.log('Invalid choice!');
            }
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            rl.close();
        }
    }
}

// Modified main function to use the prompt
async function main() {
    while (true) {
        await BitcoinAnalyzer.prompt();
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const continueAnalysis = await new Promise((resolve) => {
            rl.question('\nWould you like to perform another analysis? (y/n): ', resolve);
        });
        
        rl.close();
        
        if (continueAnalysis.toLowerCase() !== 'y') {
            console.log('Thank you for using Bitcoin Analyzer!');
            break;
        }
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinAnalyzer;