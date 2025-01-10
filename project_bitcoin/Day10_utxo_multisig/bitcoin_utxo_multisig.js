const bitcoin = require('bitcoinjs-lib');
const ECPair = require('ecpair').ECPairFactory(require('tiny-secp256k1'));

class BitcoinMultisigWallet {
    constructor(network = 'mainnet') {
        this.network = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    }

    generateKeyPair() {
        return ECPair.makeRandom({ network: this.network });
    }

    createMultisigAddress(publicKeys, m) {
        try {
            // Convert public key buffers to ECPair public points
            const pubkeys = publicKeys.map(pub => {
                return ECPair.fromPublicKey(pub, { network: this.network }).publicKey;
            });

            // Create P2MS (multisig) output script
            const p2ms = bitcoin.payments.p2ms({
                m: m,
                pubkeys: pubkeys,
                network: this.network
            });

            // Wrap in P2SH
            const p2sh = bitcoin.payments.p2sh({
                redeem: p2ms,
                network: this.network
            });

            return {
                address: p2sh.address,
                redeemScript: p2ms.output.toString('hex'),
                scriptPubKey: p2sh.output.toString('hex')
            };
        } catch (error) {
            throw new Error(`Error creating multisig address: ${error.message}`);
        }
    }

    async demonstrateMultisig() {
        try {
            // Generate three key pairs
            const keyPair1 = this.generateKeyPair();
            const keyPair2 = this.generateKeyPair();
            const keyPair3 = this.generateKeyPair();

            console.log('\nGenerated Key Pairs:');
            console.log('===================');
            console.log('Key Pair 1:');
            console.log('Private Key:', keyPair1.toWIF());
            console.log('Public Key:', keyPair1.publicKey.toString('hex'));
            console.log('\nKey Pair 2:');
            console.log('Private Key:', keyPair2.toWIF());
            console.log('Public Key:', keyPair2.publicKey.toString('hex'));
            console.log('\nKey Pair 3:');
            console.log('Private Key:', keyPair3.toWIF());
            console.log('Public Key:', keyPair3.publicKey.toString('hex'));

            // Create 2-of-3 multisig
            const multisigAddress = this.createMultisigAddress(
                [keyPair1.publicKey, keyPair2.publicKey, keyPair3.publicKey],
                2 // m (required signatures)
            );

            console.log('\nMultisig Address Details:');
            console.log('===================');
            console.log('Address:', multisigAddress.address);
            console.log('Redeem Script:', multisigAddress.redeemScript);
            console.log('ScriptPubKey:', multisigAddress.scriptPubKey);

            return {
                keyPairs: [keyPair1, keyPair2, keyPair3],
                multisigAddress
            };
        } catch (error) {
            console.error('Multisig demonstration failed:', error.message);
            throw error;
        }
    }
}

async function main() {
    try {
        const wallet = new BitcoinMultisigWallet('mainnet');
        await wallet.demonstrateMultisig();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinMultisigWallet;