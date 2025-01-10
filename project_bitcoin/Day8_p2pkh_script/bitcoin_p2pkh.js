const bitcoin = require('bitcoinjs-lib');
const ECPair = require('ecpair').ECPairFactory(require('tiny-secp256k1'));
const crypto = require('crypto');

class P2PKHScript {
    constructor(network = 'mainnet') {
        this.network = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    }

    generateKeyPair() {
        try {
            const keyPair = ECPair.makeRandom({ network: this.network });
            const { address } = bitcoin.payments.p2pkh({ 
                pubkey: keyPair.publicKey,
                network: this.network 
            });

            return {
                privateKey: keyPair.toWIF(),
                publicKey: keyPair.publicKey,
                address: address
            };
        } catch (error) {
            console.error('Error generating key pair:', error);
            throw error;
        }
    }

    createP2PKHScript(publicKey) {
        try {
            // Create a proper P2PKH script without signature
            return bitcoin.script.compile([
                bitcoin.opcodes.OP_DUP,
                bitcoin.opcodes.OP_HASH160,
                bitcoin.crypto.hash160(publicKey),
                bitcoin.opcodes.OP_EQUALVERIFY,
                bitcoin.opcodes.OP_CHECKSIG
            ]);
        } catch (error) {
            console.error('Error creating P2PKH script:', error);
            throw error;
        }
    }

    signMessage(privateKeyWIF, message) {
        try {
            const keyPair = ECPair.fromWIF(privateKeyWIF, this.network);
            const messageHash = crypto.createHash('sha256').update(message).digest();
            return keyPair.sign(messageHash);
        } catch (error) {
            console.error('Error signing message:', error);
            throw error;
        }
    }

    verifySignature(publicKey, message, signature) {
        try {
            const messageHash = crypto.createHash('sha256').update(message).digest();
            return ECPair.fromPublicKey(publicKey).verify(messageHash, signature);
        } catch (error) {
            console.error('Error verifying signature:', error);
            return false;
        }
    }

    async demonstrateP2PKH() {
        try {
            // Generate new key pair
            const wallet = this.generateKeyPair();
            console.log('\nWallet Generated:');
            console.log('==================');
            console.log('Private Key (WIF):', wallet.privateKey);
            console.log('Public Key:', wallet.publicKey.toString('hex'));
            console.log('Address:', wallet.address);

            // Sign a message
            const message = 'Hello, Bitcoin!';
            const signature = this.signMessage(wallet.privateKey, message);
            console.log('\nMessage Signing:');
            console.log('==================');
            console.log('Message:', message);
            console.log('Signature:', signature.toString('hex'));

            // Verify signature
            const isValid = this.verifySignature(wallet.publicKey, message, signature);
            console.log('\nSignature Verification:');
            console.log('==================');
            console.log('Signature is valid:', isValid);

            // Create P2PKH script
            const script = this.createP2PKHScript(wallet.publicKey);
            console.log('\nP2PKH Script:');
            console.log('==================');
            console.log('Script (hex):', script.toString('hex'));
            console.log('Script (ASM):', bitcoin.script.toASM(script));

            return {
                wallet,
                message,
                signature: signature.toString('hex'),
                script: script.toString('hex'),
                isValid
            };
        } catch (error) {
            console.error('P2PKH demonstration failed:', error.message);
            throw error;
        }
    }
}

async function main() {
    try {
        const p2pkh = new P2PKHScript('mainnet');
        await p2pkh.demonstrateP2PKH();
    } catch (error) {
        console.error('Main execution failed:', error);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = P2PKHScript;