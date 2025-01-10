# Bitcoin Taproot Implementation

Implementation of Bitcoin's Taproot functionality including key path and script path spending.

## Features

1. Key Management
   - Taproot key pair generation
   - Public key tweaking
   - Schnorr signatures

2. Address Creation
   - Taproot address generation
   - Script tree construction
   - Output script creation

3. Spending Paths
   - Key path spending
   - Script path spending
   - Control block generation

4. Transaction Handling
   - PSBT creation
   - Transaction signing
   - Signature verification

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run example:
```bash
node bitcoin_taproot.js
```

## Usage Example

```javascript
const BitcoinTaproot = require('./bitcoin_taproot');

const taproot = new BitcoinTaproot('testnet');

// Generate keys and create address
const keyPair = taproot.generateTaprootKeyPair();
const address = taproot.createTaprootAddress(keyPair.publicKey);

// Create script tree
const scriptTree = taproot.createScriptTree(['51', '7551']);
const scriptAddress = taproot.createTaprootAddress(keyPair.publicKey, scriptTree);
```

## Technical Details

1. Taproot Structure
   - MAST (Merkelized Abstract Syntax Tree)
   - Key path optimization
   - Script path flexibility

2. Signature Schemes
   - Schnorr signatures
   - Signature aggregation
   - Public key tweaking

3. Script Trees
   - Leaf script construction
   - Tree commitment
   - Control block generation