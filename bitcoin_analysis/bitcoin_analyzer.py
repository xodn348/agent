# Bitcoin Transaction Analyzer CLI
import requests
import time
from datetime import datetime
import json
import sys

class BitcoinAnalyzer:
    def __init__(self):
        self.base_url = "https://mempool.space/api"
        
    def get_mempool_info(self):
        """Get current mempool statistics"""
        try:
            response = requests.get(f"{self.base_url}/mempool")
            if response.status_code == 200:
                data = response.json()
                return {
                    'tx_count': data['count'],
                    'total_fees': data['total_fee'],
                    'mempool_size': data['vsize'],
                    'total_value': sum(tx['value'] for tx in data.get('recent', []))
                }
        except Exception as e:
            print(f"Error fetching mempool info: {e}")
        return None

    def get_fee_estimates(self):
        """Get current fee estimates"""
        try:
            response = requests.get(f"{self.base_url}/v1/fees/recommended")
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Error fetching fee estimates: {e}")
        return None

    def get_recent_transactions(self, limit=10):
        """Get recent transactions"""
        try:
            response = requests.get(f"{self.base_url}/mempool/recent")
            if response.status_code == 200:
                return response.json()[:limit]
        except Exception as e:
            print(f"Error fetching recent transactions: {e}")
        return []

    def analyze_transaction(self, txid):
        """Analyze a specific transaction"""
        try:
            response = requests.get(f"{self.base_url}/tx/{txid}")
            if response.status_code == 200:
                tx = response.json()
                
                # Basic transaction info without any calculations first
                result = {
                    'txid': txid,  # Use the input txid instead of from response
                    'status': 'found'
                }
                
                # Add additional fields only if they exist
                if 'size' in tx:
                    result['size'] = tx['size']
                if 'weight' in tx:
                    result['weight'] = tx['weight']
                if 'fee' in tx:
                    result['fee'] = tx['fee']
                if 'vin' in tx:
                    result['inputs'] = len(tx['vin'])
                if 'vout' in tx:
                    result['outputs'] = len(tx['vout'])
                    result['total_value'] = sum(out.get('value', 0) for out in tx['vout'])
                
                return result
                
        except Exception as e:
            print(f"Error analyzing transaction: {str(e)}")
            print("Full error details:", sys.exc_info())
        return None

    def print_mempool_summary(self):
        """Print a summary of current mempool status"""
        info = self.get_mempool_info()
        fees = self.get_fee_estimates()
        
        if info and fees:
            print("\n=== Bitcoin Mempool Summary ===")
            print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"Pending Transactions: {info['tx_count']:,}")
            print(f"Total Mempool Size: {info['mempool_size']:,} vBytes")
            print(f"Total Fees: {info['total_fees']:,} sats")
            print("\n=== Fee Estimates (sat/vB) ===")
            print(f"High Priority (Next Block): {fees['fastestFee']}")
            print(f"Medium Priority (~30 mins): {fees['halfHourFee']}")
            print(f"Low Priority (~1 hour): {fees['hourFee']}")

    def print_recent_transactions(self):
        """Print recent transactions"""
        txs = self.get_recent_transactions()
        if txs:
            print("\n=== Recent Transactions ===")
            for tx in txs:
                print(f"\nTXID: {tx['txid']}")
                print(f"Size: {tx.get('vsize', 'N/A')} vBytes")
                print(f"Fee: {tx.get('fee', 'N/A'):,} sats")
                if 'fee' in tx and 'vsize' in tx and tx['vsize'] > 0:
                    print(f"Fee Rate: {tx['fee']/tx['vsize']:.2f} sat/vB")
                else:
                    print("Fee Rate: N/A")

def main():
    analyzer = BitcoinAnalyzer()
    
    while True:
        print("\n=== Bitcoin Transaction Analyzer ===")
        print("1. Show Mempool Summary")
        print("2. Show Recent Transactions")
        print("3. Analyze Specific Transaction")
        print("4. Monitor Real-time Updates")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ")
        
        if choice == '1':
            analyzer.print_mempool_summary()
        
        elif choice == '2':
            analyzer.print_recent_transactions()
        
        elif choice == '3':
            txid = input("Enter transaction ID: ")
            tx_info = analyzer.analyze_transaction(txid)
            if tx_info:
                print("\n=== Transaction Analysis ===")
                for key, value in tx_info.items():
                    print(f"{key}: {value}")
        
        elif choice == '4':
            print("Monitoring mempool (Press Ctrl+C to stop)...")
            try:
                while True:
                    analyzer.print_mempool_summary()
                    analyzer.print_recent_transactions()
                    print("\nUpdating in 60 seconds...")
                    time.sleep(60)
            except KeyboardInterrupt:
                print("\nStopped monitoring.")
        
        elif choice == '5':
            print("Exiting...")
            sys.exit()
        
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()