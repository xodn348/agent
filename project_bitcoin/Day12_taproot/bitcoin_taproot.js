const bitcoin = require('bitcoinjs-lib');
const ECPair = require('ecpair').ECPairFactory(require('tiny-secp256k1'));
const tinysecp = require('tiny-secp256k1');

// Initialize the ECC library
bitcoin.initEccLib(tinysecp);

class BitcoinTaproot {
    constructor(network = 'mainnet') {
        this.network = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    }

    generateKeyPair() {
        const keyPair = ECPair.makeRandom({ network: this.network });
        return {
            privateKey: keyPair.toWIF(),
            publicKey: keyPair.publicKey.toString('hex'),
            keyPair
        };
    }

    createTaprootAddress(publicKey) {
        try {
            // Convert 33-byte public key to 32-byte x-only format
            const pubKeyXOnly = publicKey.slice(1, 33);

            // Create Taproot payment object
            const p2tr = bitcoin.payments.p2tr({
                internalPubkey: pubKeyXOnly,
                network: this.network
            });

            return {
                address: p2tr.address,
                output: p2tr.output.toString('hex'),
                version: p2tr.version,
                type: 'taproot'
            };
        } catch (error) {
            throw new Error(`Error creating Taproot address: ${error.message}`);
        }
    }

    async demonstrateTaproot() {
        try {
            // Generate key pair
            const keyPair = this.generateKeyPair();
            console.log('\nGenerated Key Pair:');
            console.log('==================');
            console.log('Private Key:', keyPair.privateKey);
            console.log('Public Key:', keyPair.publicKey);

            // Create Taproot address
            const taprootAddress = this.createTaprootAddress(keyPair.keyPair.publicKey);
            console.log('\nTaproot Address Details:');
            console.log('=======================');
            console.log('Address:', taprootAddress.address);
            console.log('Output Script:', taprootAddress.output);
            console.log('Version:', taprootAddress.version);
            console.log('Type:', taprootAddress.type);

            return {
                keyPair,
                taprootAddress
            };
        } catch (error) {
            console.error('Taproot demonstration failed:', error.message);
            throw error;
        }
    }
}

async function main() {
    try {
        const taproot = new BitcoinTaproot('mainnet');
        await taproot.demonstrateTaproot();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinTaproot;