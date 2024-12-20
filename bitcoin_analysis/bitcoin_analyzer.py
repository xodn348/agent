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

def main():
    analyzer = BitcoinAnalyzer()
    analyzer.print_mempool_summary()

if __name__ == "__main__":
    main()