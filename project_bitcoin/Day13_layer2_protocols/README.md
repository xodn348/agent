# Layer 2 Protocol Implementation

A simplified implementation of Bitcoin Layer 2 protocols including payment channels and routing.

## Features

1. Payment Channels
   - Channel creation and management
   - State updates
   - Balance tracking
   - Channel closure

2. Multi-hop Payments
   - Path finding
   - Payment execution
   - State synchronization
   - Atomic updates

3. Network Management
   - Routing table
   - Capacity tracking
   - Error handling
   - State verification

## Setup

```bash
pip install -r requirements.txt
```

## Usage

```python
from bitcoin_layer2 import Layer2Protocol

# Create Layer 2 instance
l2 = Layer2Protocol()

# Create payment channel
channel = l2.create_payment_channel(
    'chan1',
    1000,
    'Alice',
    'Bob'
)

# Find payment path
path = l2.find_payment_path('Alice', 'Charlie', 100)

# Execute payment
success = l2.execute_multi_hop_payment(path, 100)
```

## Implementation Details

1. Channel Management
   - State machine
   - Balance verification
   - Sequence numbers
   - Atomic updates

2. Routing System
   - Path finding algorithm
   - Capacity checking
   - Route optimization
   - Failure handling

3. Settlement Layer
   - Channel closure
   - Balance settlement
   - Transaction verification
   - State finalization