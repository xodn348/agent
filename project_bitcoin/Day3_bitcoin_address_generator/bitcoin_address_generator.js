const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);

class BitcoinAddressGenerator {
    constructor(network = 'mainnet') {
        this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    }

    generateMnemonic() {
        return bip39.generateMnemonic();
    }

    async createWalletFromMnemonic(mnemonic) {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const root = bip32.fromSeed(seed, this.network);
        return root;
    }

    async generateAddresses(mnemonic) {
        const root = await this.createWalletFromMnemonic(mnemonic);
        const path = `m/44'/0'/0'/0/0`;
        const child = root.derivePath(path);

        // Legacy address (P2PKH)
        const legacy = bitcoin.payments.p2pkh({
            pubkey: child.publicKey,
            network: this.network,
        });

        // SegWit address (P2SH-P2WPKH)
        const p2sh = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({
                pubkey: child.publicKey,
                network: this.network,
            }),
            network: this.network,
        });

        // Native SegWit address (P2WPKH)
        const bech32 = bitcoin.payments.p2wpkh({
            pubkey: child.publicKey,
            network: this.network,
        });

        return {
            mnemonic,
            path,
            legacy: legacy.address,
            segwit: p2sh.address,
            nativeSegwit: bech32.address,
            privateKey: child.toWIF(),
        };
    }

    validateAddress(address) {
        try {
            bitcoin.address.toOutputScript(address, this.network);
            return true;
        } catch (e) {
            return false;
        }
    }

    async displayAddresses(mnemonic) {
        try {
            const addresses = await this.generateAddresses(mnemonic);
            
            console.log('\nWallet Information:');
            console.log('==================');
            console.log('Mnemonic:', addresses.mnemonic);
            console.log('Derivation Path:', addresses.path);
            
            console.log('\nAddresses:');
            console.log('Legacy (P2PKH):', addresses.legacy);
            console.log('SegWit (P2SH-P2WPKH):', addresses.segwit);
            console.log('Native SegWit (P2WPKH):', addresses.nativeSegwit);
            
            console.log('\nPrivate Key (WIF):', addresses.privateKey);
            
            console.log('\nAddress Validation:');
            console.log('Legacy Valid:', this.validateAddress(addresses.legacy));
            console.log('SegWit Valid:', this.validateAddress(addresses.segwit));
            console.log('Native SegWit Valid:', this.validateAddress(addresses.nativeSegwit));
            
            return addresses;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

// Example usage
async function main() {
    const generator = new BitcoinAddressGenerator('mainnet');
    
    // Generate new wallet with mnemonic
    const mnemonic = generator.generateMnemonic();
    await generator.displayAddresses(mnemonic);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinAddressGenerator;