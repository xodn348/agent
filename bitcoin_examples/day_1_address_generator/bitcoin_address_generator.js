const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);

class BitcoinAddressGenerator {
    constructor(network = 'testnet') {
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

        const legacy = bitcoin.payments.p2pkh({
            pubkey: child.publicKey,
            network: this.network,
        });

        const p2sh = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({
                pubkey: child.publicKey,
                network: this.network,
            }),
            network: this.network,
        });

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
}

async function main() {
    const generator = new BitcoinAddressGenerator('testnet');
    const mnemonic = generator.generateMnemonic();
    console.log('Mnemonic:', mnemonic);
    
    const addresses = await generator.generateAddresses(mnemonic);
    console.log('\nWallet Details:');
    console.log('Path:', addresses.path);
    console.log('Legacy Address:', addresses.legacy);
    console.log('SegWit Address:', addresses.segwit);
    console.log('Native SegWit Address:', addresses.nativeSegwit);
    console.log('Private Key:', addresses.privateKey);
    
    console.log('\nAddress Validation:');
    console.log('Legacy Valid:', generator.validateAddress(addresses.legacy));
    console.log('SegWit Valid:', generator.validateAddress(addresses.segwit));
    console.log('Native SegWit Valid:', generator.validateAddress(addresses.nativeSegwit));
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinAddressGenerator;