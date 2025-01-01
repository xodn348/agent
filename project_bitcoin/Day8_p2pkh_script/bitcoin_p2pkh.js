const bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');

class P2PKHScript {
    constructor(network = 'testnet') {
        this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    }

    // Generate key pair
    generateKeyPair() {
        const keyPair = bitcoin.ECPair.makeRandom({ network: this.network });
        return {
            privateKey: keyPair.toWIF(),
            publicKey: keyPair.publicKey.toString('hex'),
            keyPair: keyPair
        };
    }

    // Create P2PKH address
    createP2PKHAddress(publicKey) {
        const pubKeyHash = bitcoin.crypto.hash160(Buffer.from(publicKey, 'hex'));
        const payment = bitcoin.payments.p2pkh({
            hash: pubKeyHash,
            network: this.network
        });
        return payment.address;
    }

    // Create locking script (scriptPubKey)
    createLockingScript(address) {
        const payment = bitcoin.payments.p2pkh({
            address: address,
            network: this.network
        });
        return {
            script: payment.output.toString('hex'),
            assembly: this.decodeScript(payment.output)
        };
    }

    // Create unlocking script (scriptSig)
    createUnlockingScript(message, keyPair) {
        // Create message hash
        const messageHash = this.hashMessage(message);
        
        // Sign the hash
        const signature = keyPair.sign(messageHash);
        const derSignature = bitcoin.script.signature.encode(signature, bitcoin.Transaction.SIGHASH_ALL);

        // Create unlocking script
        const scriptSig = bitcoin.script.compile([
            derSignature,
            keyPair.publicKey
        ]);

        return {
            script: scriptSig.toString('hex'),
            assembly: this.decodeScript(scriptSig)
        };
    }

    // Verify P2PKH transaction
    verifyTransaction(unlockingScript, lockingScript, message) {
        try {
            // Combine scripts
            const combinedScript = Buffer.concat([
                Buffer.from(unlockingScript, 'hex'),
                Buffer.from(lockingScript, 'hex')
            ]);

            // Execute script
            bitcoin.script.execute(combinedScript, this.hashMessage(message));
            return true;
        } catch (error) {
            console.error('Verification failed:', error.message);
            return false;
        }
    }

    // Helper: Hash message
    hashMessage(message) {
        return bitcoin.crypto.sha256(Buffer.from(message));
    }

    // Helper: Decode script to assembly
    decodeScript(script) {
        try {
            return bitcoin.script.toASM(script);
        } catch (error) {
            return 'Unable to decode script';
        }
    }

    // Display full transaction details
    displayTransactionDetails(keyData, message) {
        console.log('\nP2PKH Transaction Details:');
        console.log('=======================');

        // Address details
        console.log('\nKey Details:');
        console.log('Private Key (WIF):', keyData.privateKey);
        console.log('Public Key (hex):', keyData.publicKey);

        // Generate address
        const address = this.createP2PKHAddress(keyData.publicKey);
        console.log('\nBitcoin Address:', address);

        // Create scripts
        const lockingScript = this.createLockingScript(address);
        const unlockingScript = this.createUnlockingScript(message, keyData.keyPair);

        // Display scripts
        console.log('\nLocking Script (scriptPubKey):');
        console.log('Hex:', lockingScript.script);
        console.log('Assembly:', lockingScript.assembly);

        console.log('\nUnlocking Script (scriptSig):');
        console.log('Hex:', unlockingScript.script);
        console.log('Assembly:', unlockingScript.assembly);

        // Verify
        const isValid = this.verifyTransaction(
            unlockingScript.script,
            lockingScript.script,
            message
        );

        console.log('\nTransaction Verification:', isValid ? 'Valid' : 'Invalid');
        return { address, lockingScript, unlockingScript, isValid };
    }
}

// Example usage
function main() {
    const p2pkh = new P2PKHScript('testnet');
    
    // Generate new key pair
    const keyData = p2pkh.generateKeyPair();
    
    // Create and verify transaction
    const message = 'Hello, Bitcoin P2PKH!';
    const txDetails = p2pkh.displayTransactionDetails(keyData, message);
}

if (require.main === module) {
    main();
}

module.exports = P2PKHScript;