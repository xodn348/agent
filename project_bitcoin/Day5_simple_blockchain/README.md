# Simple Blockchain Implementation

A basic implementation of blockchain concepts including blocks, mining, transactions, and chain validation.

## Features

- Block creation and mining
- Proof of Work implementation
- Transaction handling
- Chain validation
- Balance tracking
- Genesis block creation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the example:
```bash
node simple_blockchain.js
```

## Usage Example

```javascript
const { Blockchain } = require('./simple_blockchain');

// Create new blockchain
const blockchain = new Blockchain();

// Add transaction
blockchain.addTransaction({
    fromAddress: 'Alice',
    toAddress: 'Bob',
    amount: 50
});

// Mine pending transactions
blockchain.minePendingTransactions('miner-address');

// Check balance
console.log(blockchain.getBalanceOfAddress('Bob'));
```