# Bitcoin Address Generator

A tool to generate different types of Bitcoin addresses for both testnet and mainnet.

## Features

- Generate mnemonic seed phrases
- Create HD wallets
- Support for multiple address types:
  - Legacy (P2PKH)
  - SegWit (P2SH-P2WPKH)
  - Native SegWit (P2WPKH)
- Address validation
- Testnet support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the example:
```bash
node bitcoin_address_generator.js
```

## Usage Example

```javascript
const generator = new BitcoinAddressGenerator('testnet');
const mnemonic = generator.generateMnemonic();
const addresses = await generator.generateAddresses(mnemonic);
console.log(addresses);
```