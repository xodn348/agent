# Bitcoin P2PKH Script Implementation

A detailed implementation of Bitcoin's Pay-to-Public-Key-Hash (P2PKH) script system.

## Features

- Generate Bitcoin key pairs
- Create P2PKH addresses
- Build locking scripts (scriptPubKey)
- Create unlocking scripts (scriptSig)
- Verify P2PKH transactions
- Display transaction details

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the example:
```bash
node bitcoin_p2pkh.js
```

## Usage Example

```javascript
const P2PKHScript = require('./bitcoin_p2pkh');

// Create P2PKH instance
const p2pkh = new P2PKHScript('testnet');

// Generate keys and create transaction
const keyData = p2pkh.generateKeyPair();
const txDetails = p2pkh.displayTransactionDetails(keyData, 'Hello Bitcoin!');
```

## Technical Details

1. P2PKH Script Flow:
   - Generate key pair (private/public keys)
   - Create Bitcoin address from public key
   - Create locking script (scriptPubKey)
   - Create unlocking script (scriptSig)
   - Verify transaction

2. Script Components:
   - Locking Script: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
   - Unlocking Script: <signature> <publicKey>

3. Verification Process:
   - Combine unlocking and locking scripts
   - Execute script operations
   - Verify signature and public key hash