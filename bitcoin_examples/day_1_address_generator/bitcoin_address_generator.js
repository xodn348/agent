# Day 1: Bitcoin Address Generator

This example demonstrates how to create different types of Bitcoin addresses including Legacy, SegWit, and Native SegWit addresses.

## Features

- Generate mnemonic seed phrases
- Create HD wallets
- Generate multiple address types:
  - Legacy (P2PKH)
  - SegWit (P2SH-P2WPKH)
  - Native SegWit (P2WPKH)
- Validate Bitcoin addresses

## Setup

1. Install dependencies:
```bash
npm init -y
npm install bitcoinjs-lib bip39 bip32 tiny-secp256k1
```

2. Run the example:
```bash
node bitcoin_address_generator.js
```

## Usage Example

```javascript
const generator = new BitcoinAddressGenerator('testnet');

// Generate new wallet
const mnemonic = generator.generateMnemonic();
console.log('Mnemonic:', mnemonic);

// Generate addresses
const addresses = await generator.generateAddresses(mnemonic);
console.log('Legacy Address:', addresses.legacy);
console.log('SegWit Address:', addresses.segwit);
console.log('Native SegWit Address:', addresses.nativeSegwit);
```

## Next Steps

1. Learn about each address type:
   - Legacy: Original Bitcoin address format
   - SegWit: Segregated Witness address format
   - Native SegWit: Newer format with better efficiency

2. Try sending test transactions between different address types

3. Explore the differences in transaction fees between address types