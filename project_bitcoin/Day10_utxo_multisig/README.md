# Bitcoin UTXO Management and Multisignature

Advanced UTXO management and multisignature transaction implementation.

## Features

1. UTXO Management
   - UTXO set tracking
   - Optimal UTXO selection
   - Balance calculation
   - UTXO consolidation

2. Multisignature Support
   - M-of-N multisig addresses
   - P2SH-wrapped multisig
   - Multiple signature coordination
   - Transaction building

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run example:
```bash
node bitcoin_utxo_multisig.js
```

## Usage Example

```javascript
const BitcoinUTXOMultisig = require('./bitcoin_utxo_multisig');

const manager = new BitcoinUTXOMultisig('testnet');

// Create multisig address
const address = await manager.createMultisigAddress(publicKeys, 2);

// Select UTXOs
const utxos = await manager.selectOptimalUTXOs(address, amount);

// Create and broadcast transaction
const tx = await manager.createMultisigTransaction(utxos, outputs, redeemScript, privateKeys);
```

## Technical Details

1. UTXO Selection Strategy:
   - Value-based selection
   - Fee consideration
   - Change output optimization

2. Multisignature Implementation:
   - P2SH script creation
   - Multiple key management
   - Signature coordination
   - Transaction validation