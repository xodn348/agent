# Bitcoin Merkle Tree Implementation

A complete implementation of Merkle Trees used in Bitcoin for efficient transaction verification.

## Features

- Build Merkle Tree from transactions
- Generate Merkle proofs
- Verify transaction inclusion
- Visualize tree structure
- Transaction validation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the example:
```bash
node merkle_tree.js
```

## Usage Example

```javascript
const MerkleTree = require('./merkle_tree');

// Create transactions
const transactions = [
    { from: 'Alice', to: 'Bob', amount: 50 },
    { from: 'Bob', to: 'Charlie', amount: 30 }
];

// Create Merkle Tree
const merkleTree = new MerkleTree(transactions);

// Get proof for a transaction
const proof = merkleTree.getProof(transactions[0]);

// Verify transaction
const isValid = merkleTree.verifyProof(transactions[0], proof);
```

## Implementation Details

- Uses SHA256 for hashing
- Implements standard Merkle Tree structure
- Supports arbitrary number of transactions
- Handles odd number of leaves
- Provides visual tree representation