from typing import List, Dict, Optional
import hashlib
import time
from dataclasses import dataclass

@dataclass
class PaymentChannel:
    channel_id: str
    capacity: int
    balance_a: int
    balance_b: int
    state: str
    sequence: int

@dataclass
class StateUpdate:
    channel_id: str
    sequence: int
    balance_a: int
    balance_b: int
    timestamp: int

class Layer2Protocol:
    def __init__(self):
        self.channels = {}
        self.state_updates = {}
        self.routing_table = {}

    def create_payment_channel(
        self,
        channel_id: str,
        capacity: int,
        participant_a: str,
        participant_b: str
    ) -> PaymentChannel:
        """Create a new payment channel"""
        channel = PaymentChannel(
            channel_id=channel_id,
            capacity=capacity,
            balance_a=capacity,
            balance_b=0,
            state='OPEN',
            sequence=0
        )
        
        self.channels[channel_id] = channel
        self.state_updates[channel_id] = []
        
        # Initialize routing
        self.routing_table[participant_a] = self.routing_table.get(participant_a, {})
        self.routing_table[participant_b] = self.routing_table.get(participant_b, {})
        self.routing_table[participant_a][participant_b] = channel_id
        self.routing_table[participant_b][participant_a] = channel_id
        
        return channel

    def update_channel_state(
        self,
        channel_id: str,
        new_balance_a: int,
        new_balance_b: int
    ) -> StateUpdate:
        """Update channel state with new balances"""
        if channel_id not in self.channels:
            raise ValueError(f"Channel {channel_id} not found")
            
        channel = self.channels[channel_id]
        if channel.state != 'OPEN':
            raise ValueError(f"Channel {channel_id} is not open")
            
        if new_balance_a + new_balance_b != channel.capacity:
            raise ValueError("Invalid balance update - sum must equal capacity")
            
        # Create state update
        update = StateUpdate(
            channel_id=channel_id,
            sequence=channel.sequence + 1,
            balance_a=new_balance_a,
            balance_b=new_balance_b,
            timestamp=int(time.time())
        )
        
        # Update channel
        channel.balance_a = new_balance_a
        channel.balance_b = new_balance_b
        channel.sequence += 1
        
        self.state_updates[channel_id].append(update)
        return update

    def find_payment_path(
        self,
        source: str,
        destination: str,
        amount: int
    ) -> Optional[List[str]]:
        """Find payment path between source and destination"""
        def dfs(current: str, target: str, path: List[str], visited: set) -> Optional[List[str]]:
            if current == target:
                return path
                
            visited.add(current)
            for next_hop, channel_id in self.routing_table[current].items():
                if next_hop not in visited:
                    channel = self.channels[channel_id]
                    # Check capacity
                    if channel.balance_a >= amount or channel.balance_b >= amount:
                        result = dfs(next_hop, target, path + [channel_id], visited)
                        if result:
                            return result
            visited.remove(current)
            return None
            
        return dfs(source, destination, [], set())

    def execute_multi_hop_payment(
        self,
        path: List[str],
        amount: int
    ) -> bool:
        """Execute payment across multiple channels"""
        # Verify path exists
        for channel_id in path:
            if channel_id not in self.channels:
                return False
                
        # Create state updates for each channel
        updates = []
        try:
            for channel_id in path:
                channel = self.channels[channel_id]
                new_balance_a = channel.balance_a - amount
                new_balance_b = channel.balance_b + amount
                if new_balance_a < 0 or new_balance_b > channel.capacity:
                    raise ValueError("Insufficient capacity")
                    
                update = self.update_channel_state(
                    channel_id,
                    new_balance_a,
                    new_balance_b
                )
                updates.append(update)
            return True
            
        except Exception as e:
            # Revert updates on failure
            for i, channel_id in enumerate(path):
                if i < len(updates):
                    channel = self.channels[channel_id]
                    channel.balance_a = updates[i].balance_a
                    channel.balance_b = updates[i].balance_b
                    channel.sequence = updates[i].sequence
            return False

    def close_channel(
        self,
        channel_id: str,
        settlement_tx: Dict
    ) -> bool:
        """Close payment channel"""
        if channel_id not in self.channels:
            return False
            
        channel = self.channels[channel_id]
        if channel.state != 'OPEN':
            return False
            
        # Verify settlement transaction
        if not self._verify_settlement(channel, settlement_tx):
            return False
            
        channel.state = 'CLOSED'
        return True

    def _verify_settlement(self, channel: PaymentChannel, settlement_tx: Dict) -> bool:
        """Verify settlement transaction"""
        # Verify amount distribution
        if settlement_tx.get('amount_a') != channel.balance_a or \
           settlement_tx.get('amount_b') != channel.balance_b:
            return False
            
        # Verify signatures (simplified)
        if 'sig_a' not in settlement_tx or 'sig_b' not in settlement_tx:
            return False
            
        return True

    def get_channel_state(self, channel_id: str) -> Dict:
        """Get current channel state"""
        if channel_id not in self.channels:
            raise ValueError(f"Channel {channel_id} not found")
            
        channel = self.channels[channel_id]
        updates = self.state_updates[channel_id]
        
        return {
            'channel_id': channel.channel_id,
            'capacity': channel.capacity,
            'balance_a': channel.balance_a,
            'balance_b': channel.balance_b,
            'state': channel.state,
            'sequence': channel.sequence,
            'update_count': len(updates),
            'last_update': updates[-1].timestamp if updates else None
        }

def main():
    # Create Layer 2 instance
    l2 = Layer2Protocol()
    
    # Create channels
    channel1 = l2.create_payment_channel('chan1', 1000, 'Alice', 'Bob')
    channel2 = l2.create_payment_channel('chan2', 1000, 'Bob', 'Charlie')
    
    print("\nInitial Channel States:")
    print(l2.get_channel_state('chan1'))
    print(l2.get_channel_state('chan2'))
    
    # Find payment path
    path = l2.find_payment_path('Alice', 'Charlie', 100)
    if path:
        print(f"\nFound path: {path}")
        # Execute payment
        success = l2.execute_multi_hop_payment(path, 100)
        print(f"Payment {'successful' if success else 'failed'}")
        
        print("\nUpdated Channel States:")
        print(l2.get_channel_state('chan1'))
        print(l2.get_channel_state('chan2'))

if __name__ == '__main__':
    main()