const axios = require('axios');

class BitcoinBlockExplorer {
    constructor(network = 'mainnet') {
        this.baseUrl = network === 'mainnet' 
            ? 'https://blockstream.info/api'
            : 'https://blockstream.info/testnet/api';
    }

    async getLatestBlockHeight() {
        try {
            const response = await axios.get(`${this.baseUrl}/blocks/tip/height`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching latest block height: ${error.message}`);
        }
    }

    async getBlock(height) {
        try {
            const response = await axios.get(`${this.baseUrl}/block-height/${height}`);
            const blockHash = response.data;
            const blockResponse = await axios.get(`${this.baseUrl}/block/${blockHash}`);
            return blockResponse.data;
        } catch (error) {
            throw new Error(`Error fetching block: ${error.message}`);
        }
    }

    async getBlockTransactions(blockHash) {
        try {
            const response = await axios.get(`${this.baseUrl}/block/${blockHash}/txs`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching block transactions: ${error.message}`);
        }
    }

    async getMiningInfo(block) {
        const difficulty = parseInt(block.bits, 16);
        const hashrate = difficulty * Math.pow(2, 32) / 600; // 600 seconds per block on average
        return {
            difficulty,
            hashrate,
            hashrateReadable: this.formatHashrate(hashrate)
        };
    }

    formatHashrate(hashrate) {
        const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s'];
        let unitIndex = 0;
        while (hashrate >= 1000 && unitIndex < units.length - 1) {
            hashrate /= 1000;
            unitIndex++;
        }
        return `${hashrate.toFixed(2)} ${units[unitIndex]}`;
    }

    async analyzeBlock(height) {
        try {
            const block = await this.getBlock(height);
            const transactions = await this.getBlockTransactions(block.id);
            const miningInfo = await this.getMiningInfo(block);
            
            console.log('\nBlock Analysis:');
            console.log('========================================');
            console.log(`Height: ${block.height}`);
            console.log(`Hash: ${block.id}`);
            console.log(`Previous Block: ${block.previousblockhash}`);
            console.log(`Timestamp: ${new Date(block.timestamp * 1000).toUTCString()}`);
            
            console.log('\nBlock Statistics:');
            console.log('========================================');
            console.log(`Size: ${(block.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`Weight: ${(block.weight / 1024 / 1024).toFixed(2)} MWU`);
            console.log(`Transaction Count: ${block.tx_count}`);
            
            console.log('\nMining Information:');
            console.log('========================================');
            console.log(`Version: ${block.version.toString(16)} (hex)`);
            console.log(`Merkle Root: ${block.merkle_root}`);
            console.log(`Difficulty: ${miningInfo.difficulty.toExponential(2)}`);
            console.log(`Estimated Hashrate: ${miningInfo.hashrateReadable}`);
            console.log(`Nonce: ${block.nonce}`);
            console.log(`Bits: ${block.bits}`);

            if (transactions.length > 0) {
                console.log('\nTransaction Summary:');
                console.log('========================================');
                let totalValue = 0;
                let totalFees = 0;

                transactions.forEach((tx, index) => {
                    if (index < 5) { // Show first 5 transactions
                        console.log(`\nTransaction #${index + 1}:`);
                        console.log(`TXID: ${tx.txid}`);
                        console.log(`Size: ${tx.size} bytes`);
                        console.log(`Fee: ${tx.fee / 100000000} BTC`);
                        
                        // Calculate total value transferred
                        const txValue = tx.vout.reduce((sum, output) => sum + output.value, 0);
                        console.log(`Value: ${txValue / 100000000} BTC`);
                        
                        totalValue += txValue;
                        totalFees += tx.fee;
                    }
                });

                console.log('\nBlock Totals:');
                console.log('========================================');
                console.log(`Total Transactions: ${transactions.length}`);
                console.log(`Total Value: ${(totalValue / 100000000).toFixed(8)} BTC`);
                console.log(`Total Fees: ${(totalFees / 100000000).toFixed(8)} BTC`);
                console.log(`Average Fee: ${((totalFees / transactions.length) / 100000000).toFixed(8)} BTC`);
            }

            return {
                block,
                transactions,
                miningInfo
            };
        } catch (error) {
            throw new Error(`Error analyzing block: ${error.message}`);
        }
    }
}

async function main() {
    try {
        const explorer = new BitcoinBlockExplorer('mainnet');

        // Get latest block height
        const latestHeight = await explorer.getLatestBlockHeight();
        console.log('Latest block height:', latestHeight);

        // Analyze latest block
        console.log('\nAnalyzing latest block...');
        await explorer.analyzeBlock(latestHeight);

        // Analyze genesis block
        console.log('\nAnalyzing genesis block...');
        await explorer.analyzeBlock(0);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinBlockExplorer;