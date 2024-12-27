# Bitcoin Block Explorer

A Node.js implementation of a Bitcoin block explorer that fetches and analyzes blockchain data.

## Features

- Fetch latest block information
- Get block details by height or hash
- Analyze block contents and statistics
- View transaction details
- Support for both mainnet and testnet

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the explorer:
```bash
node bitcoin_block_explorer.js
```

## Usage Example

```javascript
const explorer = new BitcoinBlockExplorer('testnet');

// Get latest block info
const latestHeight = await explorer.getLatestBlock();
console.log(`Latest block: ${latestHeight}`);

// Analyze specific block
const blockInfo = await explorer.displayBlockInfo(latestHeight);
```