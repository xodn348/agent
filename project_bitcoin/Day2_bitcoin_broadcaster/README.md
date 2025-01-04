# Bitcoin Transaction Broadcaster

A tool for creating, signing, and broadcasting Bitcoin transactions.

## Features

- Transaction creation
- PSBT handling
- Transaction signing
- Network broadcasting
- Transaction verification
- Confirmation tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run example:
```bash
node bitcoin_broadcaster.js
```

## Usage Example

```javascript
const BitcoinBroadcaster = require('./bitcoin_broadcaster');

const broadcaster = new BitcoinBroadcaster('testnet');

// Create and broadcast transaction
const psbt = await broadcaster.createTransaction(inputs, outputs);
const signedPsbt = await broadcaster.signTransaction(psbt, privateKey);
const result = await broadcaster.broadcast(signedPsbt);
```

## Technical Details

1. Transaction Creation
   - UTXO management
   - Input selection
   - Output creation
   - Fee calculation

2. Transaction Signing
   - Private key handling
   - PSBT signing
   - Input finalization

3. Broadcasting
   - Network communication
   - Transaction verification
   - Confirmation tracking