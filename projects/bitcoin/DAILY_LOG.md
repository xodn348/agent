# Bitcoin Project Daily Log

## December 2024

### [Day 2: Bitcoin Block Explorer](day_2_block_explorer/) - 2024-12-27

#### Overview
Implemented a Bitcoin block explorer that fetches and analyzes blockchain data using the Blockstream API.

#### Features Implemented
- Latest block information retrieval
- Block lookup by height or hash
- Transaction details fetching
- Block statistics analysis
- Coinbase transaction parsing
- Data formatting utilities

#### Technical Details
- Uses axios for API requests
- Async/await implementation
- Error handling for API calls
- Support for both testnet and mainnet

#### Files
- `bitcoin_block_explorer.js`: Main implementation
- `package.json`: Dependencies
- `README.md`: Usage instructions

#### Usage Example
```javascript
const explorer = new BitcoinBlockExplorer('testnet');
const latestBlock = await explorer.getLatestBlock();
const blockInfo = await explorer.displayBlockInfo(latestBlock);
```

#### Dependencies
- axios: ^1.6.2

---

### [Day 1: Bitcoin Address Generator](day_1_address_generator/) - 2024-12-26

#### Overview
Implemented a comprehensive Bitcoin address generator supporting multiple address types and networks.

#### Features Implemented
- Mnemonic seed phrase generation
- HD wallet creation
- Multiple address types:
  - Legacy (P2PKH)
  - SegWit (P2SH-P2WPKH)
  - Native SegWit (P2WPKH)
- Address validation
- Testnet support

#### Technical Details
- Used bitcoinjs-lib for core functionality
- Implemented BIP39 for mnemonic generation
- Added BIP32 for HD wallet support
- Full testnet compatibility

#### Dependencies
- bitcoinjs-lib: ^6.1.3
- bip39: ^3.1.0
- bip32: ^4.0.0
- tiny-secp256k1: ^2.2.3

---