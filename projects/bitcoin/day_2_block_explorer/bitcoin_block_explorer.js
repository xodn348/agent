const axios = require('axios');

const BLOCKCHAIN_API_BASE = 'https://blockstream.info/api';

class BitcoinBlockExplorer {
    async getLatestBlockHeight() {
        try {
            const response = await axios.get(`${BLOCKCHAIN_API_BASE}/blocks/tip/height`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching latest block height: ${error.message}`);
        }
    }

    async getBlockInfo(blockHash) {
        try {
            const response = await axios.get(`${BLOCKCHAIN_API_BASE}/block/${blockHash}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching block info: ${error.message}`);
        }
    }

    async getBlockByHeight(height) {
        try {
            const response = await axios.get(`${BLOCKCHAIN_API_BASE}/block-height/${height}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching block by height: ${error.message}`);
        }
    }

    async analyzeBlock(blockHash) {
        try {
            const blockInfo = await this.getBlockInfo(blockHash);
            return {
                hash: blockInfo.id,
                height: blockInfo.height,
                timestamp: new Date(blockInfo.timestamp * 1000).toISOString(),
                size: blockInfo.size,
                weight: blockInfo.weight,
                transactionCount: blockInfo.tx_count,
                previousBlockHash: blockInfo.previousblockhash,
            };
        } catch (error) {
            throw new Error(`Error analyzing block: ${error.message}`);
        }
    }
}

async function main() {
    const explorer = new BitcoinBlockExplorer();

    try {
        // Get latest block height
        const latestHeight = await explorer.getLatestBlockHeight();
        console.log(`Latest block height: ${latestHeight}\n`);

        // Analyze latest block
        console.log('Analyzing latest block...');
        const latestBlockHash = await explorer.getBlockByHeight(latestHeight);
        const latestBlockInfo = await explorer.analyzeBlock(latestBlockHash);
        console.log(latestBlockInfo);
        console.log();

        // Analyze genesis block
        console.log('Analyzing genesis block...');
        const genesisBlockHash = await explorer.getBlockByHeight(0);
        const genesisBlockInfo = await explorer.analyzeBlock(genesisBlockHash);
        console.log(genesisBlockInfo);
    } catch (error) {
        console.error(error.message);
    }
}

main();