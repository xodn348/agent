# Bitcoin Transaction Broadcaster

A tool to create and broadcast Bitcoin transactions to the mainnet.

## Features

- Create Bitcoin transactions with 1 input and 1 output
- Automatic change address handling
- Multiple broadcasting services (Blockstream and Mempool.space)
- Transaction verification
- Fee customization

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the script:
```bash
python bitcoin_tx_broadcast.py
```

## Required Information

To create a transaction, you'll need:
- Private key in WIF format
- Input transaction ID (TXID)
- Input vout (output index)
- Input amount
- Recipient's Bitcoin address
- Amount to send
- Transaction fee (optional)

## Safety Notes

- ALWAYS verify transaction details before broadcasting
- Keep private keys secure and NEVER share them
- Test with small amounts first
- Verify recipient addresses carefully
- Make sure the input transaction is unspent and confirmed

## Transaction Tracking

After broadcasting, you can track your transaction at:
- https://mempool.space/tx/[txid]
- https://blockstream.info/tx/[txid]