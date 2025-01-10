const axios = require('axios');

class BitcoinFeeEstimator {
    constructor(network = 'mainnet') {
        this.baseUrl = network === 'mainnet' 
            ? 'https://blockstream.info/api'
            : 'https://blockstream.info/testnet/api';
        this.delayBetweenRequests = 1000; // 1 second delay
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getRecentBlocks(count = 10) {
        try {
            // Get latest block height
            const tipResponse = await axios.get(`${this.baseUrl}/blocks/tip/height`);
            const tipHeight = tipResponse.data;
            
            await this.sleep(this.delayBetweenRequests);

            const blocks = [];
            for (let height = tipHeight; height > tipHeight - count; height--) {
                try {
                    const response = await axios.get(`${this.baseUrl}/block-height/${height}`);
                    const blockHash = response.data;
                    
                    await this.sleep(this.delayBetweenRequests);
                    
                    const blockResponse = await axios.get(`${this.baseUrl}/block/${blockHash}`);
                    blocks.push(blockResponse.data);
                    
                    await this.sleep(this.delayBetweenRequests);
                    
                    console.log(`Processed block ${height}`);
                } catch (error) {
                    console.error(`Error fetching block ${height}:`, error.message);
                    continue;
                }
            }
            return blocks;
        } catch (error) {
            throw new Error(`Error fetching blocks: ${error.message}`);
        }
    }

    calculateNetworkStats(blocks) {
        const stats = {
            averageBlockSize: 0,
            averageTxCount: 0,
            averageFeeRate: 0,
            medianFeeRate: [],
            blockSizes: [],
            txCounts: []
        };

        blocks.forEach(block => {
            stats.blockSizes.push(block.size);
            stats.txCounts.push(block.tx_count);
            stats.averageBlockSize += block.size;
            stats.averageTxCount += block.tx_count;
        });

        stats.averageBlockSize = stats.averageBlockSize / blocks.length;
        stats.averageTxCount = stats.averageTxCount / blocks.length;

        return stats;
    }

    async estimateFee(priority = 'medium') {
        try {
            const response = await axios.get(`${this.baseUrl}/fee-estimates`);
            const estimates = response.data;

            // Convert priority to target blocks
            const targetBlocks = {
                high: 1,
                medium: 3,
                low: 6
            }[priority] || 3;

            const feeRate = estimates[targetBlocks.toString()];
            return {
                feeRate,
                priority,
                targetBlocks,
                estimatedFeePerByte: feeRate,
                estimatedFeeForTransaction: (feeRate * 225) // Assuming typical transaction size
            };
        } catch (error) {
            throw new Error(`Error estimating fee: ${error.message}`);
        }
    }

    async getNetworkStats() {
        try {
            console.log('Fetching Network Stats...');
            const blocks = await this.getRecentBlocks(5); // Reduced to 5 blocks to avoid rate limits
            const stats = this.calculateNetworkStats(blocks);
            
            console.log('\nNetwork Statistics:');
            console.log('===================');
            console.log(`Average Block Size: ${(stats.averageBlockSize / 1024 / 1024).toFixed(2)} MB`);
            console.log(`Average Transactions per Block: ${Math.round(stats.averageTxCount)}`);
            
            const feeEstimates = await Promise.all([
                this.estimateFee('high'),
                this.estimateFee('medium'),
                this.estimateFee('low')
            ]);

            console.log('\nFee Estimates:');
            console.log('===================');
            feeEstimates.forEach(estimate => {
                console.log(`${estimate.priority.toUpperCase()} Priority:`);
                console.log(`  Target Blocks: ${estimate.targetBlocks}`);
                console.log(`  Fee Rate: ${estimate.feeRate} sat/vB`);
                console.log(`  Estimated Fee for typical tx: ${estimate.estimatedFeeForTransaction} satoshis`);
            });

            return { stats, feeEstimates };
        } catch (error) {
            throw new Error(`Error getting network stats: ${error.message}`);
        }
    }
}

async function main() {
    try {
        const estimator = new BitcoinFeeEstimator('mainnet');
        await estimator.getNetworkStats();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinFeeEstimator;