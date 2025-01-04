# Day 1: Bitcoin Transaction Analysis

A tool for analyzing Bitcoin transactions and blockchain data.

## Features

- Transaction data fetching
- Input/output analysis
- Fee calculation
- Size and weight analysis
- Script parsing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run example:
```bash
node bitcoin_analyzer.js
```

## Usage Example

```javascript
const BitcoinAnalyzer = require('./bitcoin_analyzer');

const analyzer = new BitcoinAnalyzer('testnet');
const analysis = await analyzer.displayAnalysis('your_transaction_id');
```

## Technical Details

1. Transaction Analysis:
   - Size calculation
   - Fee analysis
   - Input/output parsing
   - Script examination

2. Data Formatting:
   - Bitcoin value conversion
   - Script hex decoding
   - JSON data parsing