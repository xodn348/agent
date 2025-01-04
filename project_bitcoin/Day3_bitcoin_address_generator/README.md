# Bitcoin Address Generator

A comprehensive tool for generating different types of Bitcoin addresses using HD wallets.

## Features

- Mnemonic generation
- HD wallet support
- Multiple address types:
  - Legacy (P2PKH)
  - SegWit (P2SH-P2WPKH)
  - Native SegWit (P2WPKH)
- Address validation
- Private key management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run example:
```bash
node bitcoin_address_generator.js
```

## Usage Example

```javascript
const BitcoinAddressGenerator = require('./bitcoin_address_generator');

const generator = new BitcoinAddressGenerator('testnet');
const mnemonic = generator.generateMnemonic();
const addresses = await generator.generateAddresses(mnemonic);
```

## Technical Details

1. HD Wallet Structure:
   - BIP39 mnemonics
   - BIP32 derivation paths
   - Key pair generation

2. Address Types:
   - Legacy P2PKH (1...)
   - SegWit P2SH-P2WPKH (3...)
   - Native SegWit P2WPKH (bc1...)

3. Security:
   - Secure key generation
   - Mnemonic backup
   - Address validation