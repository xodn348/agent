const axios = require('axios');

class BitcoinBlockExplorer {
    constructor(network = 'testnet') {
        this.baseUrl = network === 'testnet' 
            ? 'https://blockstream.info/testnet/api'
            : 'https://blockstream.info/api';
    }

    async getLatestBlock() {
        try {
            const response = await axios.get(`${this.baseUrl}/blocks/tip/height`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching latest block: ${error.message}`);
        }
    }

    async getBlockByHeight(height) {
        try {
            const response = await axios.get(`${this.baseUrl}/block-height/${height}`);
            const blockHash = response.data;
            return this.getBlockByHash(blockHash);
        } catch (error) {
            throw new Error(`Error fetching block at height ${height}: ${error.message}`);
        }
    }

    async getBlockByHash(hash) {
        try {
            const response = await axios.get(`${this.baseUrl}/block/${hash}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching block ${hash}: ${error.message}`);
        }
    }

    async getTransaction(txid) {
        try {
            const response = await axios.get(`${this.baseUrl}/tx/${txid}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching transaction ${txid}: ${error.message}`);
        }
    }

    async getTransactionHex(txid) {
        try {
            const response = await axios.get(`${this.baseUrl}/tx/${txid}/hex`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching transaction hex ${txid}: ${error.message}`);
        }
    }

    async getBlockTransactions(hash) {
        try {
            const response = await axios.get(`${this.baseUrl}/block/${hash}/txids`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching block transactions ${hash}: ${error.message}`);
        }
    }

    async analyzeBlock(height) {
        try {
            const blockHash = await this.getBlockByHeight(height);
            const block = await this.getBlockByHash(blockHash);
            const transactions = await this.getBlockTransactions(blockHash);
            const coinbaseTx = await this.getTransaction(transactions[0]);

            const blockAnalysis = {
                height: block.height,
                hash: block.id,
                timestamp: new Date(block.timestamp * 1000).toISOString(),
                transactionCount: block.tx_count,
                size: block.size,
                weight: block.weight,
                version: block.version,
                merkleRoot: block.merkle_root,
                bits: block.bits,
                nonce: block.nonce,
                coinbaseValue: coinbaseTx.vout.reduce((acc, output) => acc + output.value, 0),
                totalTransactions: transactions.length,
            };

            return blockAnalysis;
        } catch (error) {
            throw new Error(`Error analyzing block: ${error.message}`);
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async displayBlockInfo(height) {
        try {
            const analysis = await this.analyzeBlock(height);
            console.log('\nBlock Information:');
            console.log('==================');
            console.log(`Height: ${analysis.height}`);
            console.log(`Hash: ${analysis.hash}`);
            console.log(`Timestamp: ${analysis.timestamp}`);
            console.log(`Transaction Count: ${analysis.transactionCount}`);
            console.log(`Size: ${this.formatBytes(analysis.size)}`);
            console.log(`Weight: ${analysis.weight}`);
            console.log(`Version: ${analysis.version}`);
            console.log(`Merkle Root: ${analysis.merkleRoot}`);
            console.log(`Bits: ${analysis.bits}`);
            console.log(`Nonce: ${analysis.nonce}`);
            console.log(`Coinbase Value: ${analysis.coinbaseValue / 100000000} BTC`);
            return analysis;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

async function main() {
    const explorer = new BitcoinBlockExplorer('testnet');
    
    try {
        const latestHeight = await explorer.getLatestBlock();
        console.log(`Latest block height: ${latestHeight}`);

        console.log('\nAnalyzing latest block...');
        await explorer.displayBlockInfo(latestHeight);

        console.log('\nAnalyzing genesis block...');
        await explorer.displayBlockInfo(0);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinBlockExplorer;