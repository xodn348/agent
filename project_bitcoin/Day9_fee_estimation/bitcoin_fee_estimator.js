const axios = require('axios');

class BitcoinFeeEstimator {
    constructor(network = 'testnet') {
        this.baseUrl = network === 'testnet'
            ? 'https://blockstream.info/testnet/api'
            : 'https://blockstream.info/api';
    }

    async getNetworkStats() {
        try {
            // Get latest blocks for fee analysis
            const blocks = await this.getRecentBlocks(10);
            const stats = await this.analyzeBlocks(blocks);
            return stats;
        } catch (error) {
            throw new Error(`Error getting network stats: ${error.message}`);
        }
    }

    async getRecentBlocks(count) {
        try {
            // Get latest block height
            const heightResponse = await axios.get(`${this.baseUrl}/blocks/tip/height`);
            const currentHeight = heightResponse.data;

            // Get recent blocks
            const blocks = [];
            for (let i = 0; i < count; i++) {
                const blockResponse = await axios.get(`${this.baseUrl}/block-height/${currentHeight - i}`);
                const blockHash = blockResponse.data;
                const blockData = await axios.get(`${this.baseUrl}/block/${blockHash}`);
                blocks.push(blockData.data);
            }

            return blocks;
        } catch (error) {
            throw new Error(`Error fetching blocks: ${error.message}`);
        }
    }

    async analyzeBlocks(blocks) {
        const stats = {
            avgBlockSize: 0,
            avgTxCount: 0,
            avgFeeRates: {
                high: 0,    // Top 10%
                medium: 0,  // Median
                low: 0      // Bottom 10%
            },
            mempool: await this.getMempoolInfo()
        };

        // Calculate averages
        stats.avgBlockSize = blocks.reduce((sum, block) => sum + block.size, 0) / blocks.length;
        stats.avgTxCount = blocks.reduce((sum, block) => sum + block.tx_count, 0) / blocks.length;

        // Get fee information
        const feeRates = [];
        for (const block of blocks) {
            const txs = await this.getBlockTransactions(block.id);
            for (const tx of txs) {
                if (tx.fee && tx.size) {
                    feeRates.push(tx.fee / tx.size); // sat/byte
                }
            }
        }

        // Calculate fee percentiles
        feeRates.sort((a, b) => a - b);
        const len = feeRates.length;
        stats.avgFeeRates = {
            high: feeRates[Math.floor(len * 0.9)] || 0,
            medium: feeRates[Math.floor(len * 0.5)] || 0,
            low: feeRates[Math.floor(len * 0.1)] || 0
        };

        return stats;
    }

    async getMempoolInfo() {
        try {
            const response = await axios.get(`${this.baseUrl}/mempool`);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching mempool info: ${error.message}`);
        }
    }

    estimateTransactionSize(inputCount, outputCount) {
        // Size calculation based on standard P2PKH transaction
        const baseSize = 10; // Version + locktime
        const inputSize = 148; // Previous txid + index + scriptSig + sequence
        const outputSize = 34; // Value + scriptPubKey

        return baseSize + (inputSize * inputCount) + (outputSize * outputCount);
    }

    calculateFee(size, feeRate) {
        return Math.ceil(size * feeRate);
    }

    async recommendFee(inputCount, outputCount, priority = 'medium') {
        try {
            // Get current network stats
            const stats = await this.getNetworkStats();
            
            // Calculate transaction size
            const txSize = this.estimateTransactionSize(inputCount, outputCount);
            
            // Get appropriate fee rate based on priority
            const feeRate = stats.avgFeeRates[priority];
            
            // Calculate total fee
            const totalFee = this.calculateFee(txSize, feeRate);

            return {
                transactionSize: txSize,
                feeRate: feeRate,
                totalFee: totalFee,
                networkStats: stats,
                priority: priority,
                estimatedConfirmationBlocks: this.estimateConfirmationBlocks(priority)
            };
        } catch (error) {
            throw new Error(`Error calculating recommended fee: ${error.message}`);
        }
    }

    estimateConfirmationBlocks(priority) {
        switch(priority) {
            case 'high': return '1-2 blocks';
            case 'medium': return '3-6 blocks';
            case 'low': return '6+ blocks';
            default: return 'unknown';
        }
    }

    async displayFeeRecommendation(inputCount, outputCount) {
        console.log('\nCalculating Fee Recommendations...');
        console.log('================================');

        for (const priority of ['high', 'medium', 'low']) {
            try {
                const recommendation = await this.recommendFee(inputCount, outputCount, priority);
                
                console.log(`\n${priority.toUpperCase()} Priority:`);
                console.log(`Transaction Size: ${recommendation.transactionSize} bytes`);
                console.log(`Fee Rate: ${recommendation.feeRate.toFixed(2)} sat/byte`);
                console.log(`Total Fee: ${recommendation.totalFee} satoshis (${(recommendation.totalFee / 100000000).toFixed(8)} BTC)`);
                console.log(`Estimated Confirmation: ${recommendation.estimatedConfirmationBlocks}`);
            } catch (error) {
                console.error(`Error calculating ${priority} priority fee:`, error.message);
            }
        }
    }
}

// Example usage
async function main() {
    const estimator = new BitcoinFeeEstimator('testnet');
    
    try {
        // Get current network stats
        console.log('Fetching Network Stats...');
        const stats = await estimator.getNetworkStats();
        console.log('\nNetwork Statistics:');
        console.log(`Average Block Size: ${(stats.avgBlockSize / 1024).toFixed(2)} KB`);
        console.log(`Average Transactions per Block: ${Math.round(stats.avgTxCount)}`);
        
        // Get fee recommendations for a 2-input, 2-output transaction
        await estimator.displayFeeRecommendation(2, 2);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinFeeEstimator;