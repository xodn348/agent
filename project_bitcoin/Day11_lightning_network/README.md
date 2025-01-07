# Lightning Network Implementation

A basic implementation of Lightning Network concepts including payment channels and HTLCs.

## Features

1. Payment Channels
   - Channel creation
   - Channel funding
   - Balance updates
   - Channel closure

2. HTLC Support
   - Hash Time-Locked Contracts
   - Timelock implementation
   - Preimage verification

3. Transaction Types
   - Funding transactions
   - Commitment transactions
   - Closing transactions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run example:
```bash
node lightning_network.js
```

## Usage Example

```javascript
const LightningNetwork = require('./lightning_network');

// Create Lightning Network instance
const ln = new LightningNetwork('testnet');

// Create and fund channel
const channel = ln.createPaymentChannel(channelId, fundingAmount, pubKey1, pubKey2);
const fundingTx = await ln.createFundingTransaction(channel, fundingAmount);

// Create HTLC
const htlc = await ln.createHTLC(channel, amount, preimageHash, timelock);

// Close channel
const closingTx = await ln.closeChannel(channel, true);
```

## Technical Details

1. Channel States
   - Initialization
   - Funding
   - Active
   - Closing

2. Transaction Types
   - Funding transaction (2-of-2 multisig)
   - Commitment transactions
   - HTLC transactions
   - Closing transactions

3. Security Features
   - Timelock implementation
   - Revocation keys
   - Proper signing order