# Bitcoin Script Interpreter

A simple implementation of Bitcoin's Script language interpreter. This implementation helps understand how Bitcoin processes transaction scripts.

## Features

- Stack-based execution
- Common Bitcoin Script opcodes
- P2PKH script support
- Flow control operations
- Arithmetic operations
- Stack manipulations

## Supported Operations

### Stack Operations
- OP_DUP: Duplicates top stack item
- OP_DROP: Removes top stack item
- OP_SWAP: Swaps top two stack items

### Arithmetic
- OP_ADD: Adds top two items
- OP_SUB: Subtracts top two items

### Crypto
- OP_HASH160: Performs RIPEMD160(SHA256(x))
- OP_CHECKSIG: Verifies signature

### Flow Control
- OP_IF/OP_ELSE/OP_ENDIF: Conditional execution

## Setup

1. Install:
```bash
npm install
```

2. Run examples:
```bash
node bitcoin_script_interpreter.js
```

## Usage Example

```javascript
const BTCScriptInterpreter = require('./bitcoin_script_interpreter');

// Create interpreter
const interpreter = new BTCScriptInterpreter();

// Execute P2PKH script
interpreter.stack.push('signature');
interpreter.stack.push('publicKey');
interpreter.executeScript('OP_DUP OP_HASH160 pubKeyHash OP_EQUALVERIFY OP_CHECKSIG');
```