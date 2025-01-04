const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');

class BitcoinAnalyzer {
    constructor(network = 'testnet') {
        this.baseUrl = network === 'testnet' 
            ? 'https://blockstream.info/testnet/api'
            : 'https://blockstream.info/api';
        this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
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
            inputs: this.parseInputs(tx.vin),
            outputs: this.parseOutputs(tx.vout),
            totalInput: this.calculateTotalInput(tx.vin),
            totalOutput: this.calculateTotalOutput(tx.vout),
        };

        analysis.feeSatPerByte = analysis.fee / analysis.size;
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
            console.log('===================');
            console.log(`TXID: ${analysis.txid}`);
            console.log(`Version: ${analysis.version}`);
            console.log(`Size: ${analysis.size} bytes`);
            console.log(`Weight: ${analysis.weight}`);
            console.log(`Locktime: ${analysis.locktime}`);
            console.log(`Fee: ${this.formatBitcoin(analysis.fee)} BTC`);
            console.log(`Fee Rate: ${analysis.feeSatPerByte.toFixed(2)} sat/byte`);
            console.log(`\nInputs: ${analysis.inputs.length}`);
            console.log(`Total Input: ${this.formatBitcoin(analysis.totalInput)} BTC`);
            console.log(`\nOutputs: ${analysis.outputs.length}`);
            console.log(`Total Output: ${this.formatBitcoin(analysis.totalOutput)} BTC`);
            
            return analysis;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

// Example usage
async function main() {
    const analyzer = new BitcoinAnalyzer('testnet');
    
    // Example transaction ID
    const txid = '2e3da8fbc1eaca8ed9b7c2db9d4c5c5e4bfcb788a3ff87626d52d8b9f525b3b5';
    await analyzer.displayAnalysis(txid);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinAnalyzer;