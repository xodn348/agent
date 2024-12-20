#!/usr/bin/env python3
import requests
from bitcoinutils.setup import setup
from bitcoinutils.utils import to_satoshis
from bitcoinutils.transactions import Transaction, TxInput, TxOutput
from bitcoinutils.keys import P2pkhAddress, PrivateKey
from bitcoinutils.script import Script

class BitcoinTransactionBroadcaster:
    def __init__(self):
        # Initialize the bitcoin utils library
        setup('mainnet')
        self.broadcast_urls = [
            'https://blockstream.info/api/tx',  # Blockstream
            'https://mempool.space/api/tx'      # Mempool Space
        ]

    def create_and_sign_transaction(self, private_key_wif, input_txid, input_vout, 
                                  input_amount_btc, to_address, amount_btc, fee_btc=0.0001):
        try:
            # Convert amounts to satoshis
            input_amount_sat = to_satoshis(input_amount_btc)
            output_amount_sat = to_satoshis(amount_btc)
            fee_sat = to_satoshis(fee_btc)
            
            # Calculate change
            change_amount_sat = input_amount_sat - output_amount_sat - fee_sat
            if change_amount_sat < 0:
                raise ValueError("Insufficient funds for transaction and fee")

            # Create private key object and get public address
            priv_key = PrivateKey(wif=private_key_wif)
            pub_key = priv_key.get_public_key()
            from_address = pub_key.get_address()

            # Create transaction input
            tx_input = TxInput(input_txid, input_vout)

            # Create transaction output for recipient
            recipient_addr = P2pkhAddress(to_address)
            tx_output = TxOutput(output_amount_sat, recipient_addr.to_script_pub_key())

            # Create change output
            outputs = [tx_output]
            if change_amount_sat > 0:
                change_output = TxOutput(change_amount_sat, from_address.to_script_pub_key())
                outputs.append(change_output)

            # Create and sign transaction
            tx = Transaction(inputs=[tx_input], outputs=outputs)
            sig = priv_key.sign_input(tx, 0, from_address.to_script_pub_key())
            pk_script = Script([sig, pub_key.to_hex()])
            tx_input.script_sig = pk_script

            return {
                'success': True,
                'raw_tx': tx.serialize(),
                'txid': tx.get_txid(),
                'details': {
                    'input_amount': input_amount_btc,
                    'output_amount': amount_btc,
                    'fee': fee_btc,
                    'change': change_amount_sat / 100000000
                }
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def verify_transaction(self, tx_hex):
        try:
            # Basic size and format verification
            if len(tx_hex) < 100:
                return False, "Transaction too small"
            
            # Check if it's a valid hex string
            int(tx_hex, 16)
            
            return True, "Transaction verification passed"
        except ValueError:
            return False, "Invalid transaction format"
        except Exception as e:
            return False, f"Verification error: {str(e)}"

    def broadcast_transaction(self, tx_hex):
        verification_result, verification_message = self.verify_transaction(tx_hex)
        if not verification_result:
            return {
                'success': False,
                'error': f"Verification failed: {verification_message}"
            }

        responses = []
        for url in self.broadcast_urls:
            try:
                response = requests.post(url, data=tx_hex)
                if response.status_code == 200:
                    return {
                        'success': True,
                        'txid': response.text.strip(),
                        'broadcast_url': url
                    }
                responses.append({
                    'url': url,
                    'status': response.status_code,
                    'response': response.text
                })
            except Exception as e:
                responses.append({
                    'url': url,
                    'error': str(e)
                })

        return {
            'success': False,
            'error': "Broadcasting failed on all attempts",
            'details': responses
        }

def main():
    print("Bitcoin Transaction Creator and Broadcaster")
    print("------------------------------------------")
    print("WARNING: This will broadcast to Bitcoin mainnet!")
    print("Make sure you have verified all details carefully.")
    
    confirm = input("\nDo you want to continue? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Operation cancelled")
        return

    try:
        broadcaster = BitcoinTransactionBroadcaster()

        # Get transaction details from user
        private_key = input("Enter private key (WIF format): ")
        input_txid = input("Enter input transaction ID: ")
        input_vout = int(input("Enter input vout (transaction output index): "))
        input_amount = float(input("Enter input amount (BTC): "))
        to_address = input("Enter recipient's Bitcoin address: ")
        amount = float(input("Enter amount to send (BTC): "))
        fee = float(input("Enter fee (BTC) [default=0.0001]: ") or "0.0001")

        # Create and sign transaction
        print("\nCreating and signing transaction...")
        result = broadcaster.create_and_sign_transaction(
            private_key, input_txid, input_vout,
            input_amount, to_address, amount, fee
        )

        if not result['success']:
            print(f"Error creating transaction: {result['error']}")
            return

        # Show transaction details and ask for confirmation
        print("\nTransaction created successfully!")
        print(f"TXID: {result['txid']}")
        print("\nDetails:")
        for key, value in result['details'].items():
            print(f"{key}: {value} BTC")

        print("\nRaw Transaction (hex):")
        print(result['raw_tx'])

        confirm = input("\nDo you want to broadcast this transaction? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Broadcasting cancelled")
            return

        # Broadcast transaction
        print("\nBroadcasting transaction...")
        broadcast_result = broadcaster.broadcast_transaction(result['raw_tx'])

        if broadcast_result['success']:
            print("\nTransaction successfully broadcast!")
            print(f"TXID: {broadcast_result['txid']}")
            print(f"Broadcast via: {broadcast_result['broadcast_url']}")
            print("\nYou can track your transaction at:")
            print(f"https://mempool.space/tx/{broadcast_result['txid']}")
        else:
            print(f"\nError broadcasting transaction: {broadcast_result['error']}")
            if 'details' in broadcast_result:
                print("\nBroadcast attempt details:")
                for response in broadcast_result['details']:
                    print(f"\nURL: {response['url']}")
                    if 'error' in response:
                        print(f"Error: {response['error']}")
                    else:
                        print(f"Status: {response['status']}")
                        print(f"Response: {response['response']}")

    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
    except Exception as e:
        print(f"\nError: {str(e)}")

if __name__ == "__main__":
    main()