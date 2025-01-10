const bitcoin = require('bitcoinjs-lib');
const ECPair = require('ecpair').ECPairFactory(require('tiny-secp256k1'));

class LightningNetwork {
    constructor(network = 'mainnet') {
        this.network = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    }

    generateNodeKeys() {
        return ECPair.makeRandom({ network: this.network });
    }

    createFundingTransaction(alicePubkey, bobPubkey, fundingAmount) {
        try {
            // Convert public keys to proper format
            const pubkeys = [
                ECPair.fromPublicKey(alicePubkey, { network: this.network }).publicKey,
                ECPair.fromPublicKey(bobPubkey, { network: this.network }).publicKey
            ].sort((a, b) => a.compare(b)); // Sort pubkeys for deterministic script

            // Create 2-of-2 multisig script
            const p2ms = bitcoin.payments.p2ms({
                m: 2,
                pubkeys,
                network: this.network
            });

            // Wrap in P2WSH (native segwit)
            const p2wsh = bitcoin.payments.p2wsh({
                redeem: p2ms,
                network: this.network
            });

            return {
                address: p2wsh.address,
                witnessScript: p2ms.output.toString('hex'),
                fundingAmount
            };
        } catch (error) {
            throw new Error(`Error creating funding transaction: ${error.message}`);
        }
    }

    createCommitmentTransaction(channelState) {
        try {
            const { alicePubkey, bobPubkey, aliceBalance, bobBalance } = channelState;

            // Create outputs for both parties
            const aliceOutput = {
                address: bitcoin.payments.p2wpkh({ 
                    pubkey: alicePubkey,
                    network: this.network 
                }).address,
                value: aliceBalance
            };

            const bobOutput = {
                address: bitcoin.payments.p2wpkh({ 
                    pubkey: bobPubkey,
                    network: this.network 
                }).address,
                value: bobBalance
            };

            return {
                outputs: [aliceOutput, bobOutput],
                totalAmount: aliceBalance + bobBalance
            };
        } catch (error) {
            throw new Error(`Error creating commitment transaction: ${error.message}`);
        }
    }

    async demonstrateChannel() {
        try {
            // Generate keys for Alice and Bob
            const alice = this.generateNodeKeys();
            const bob = this.generateNodeKeys();

            console.log('\nNode Information:');
            console.log('=================');
            console.log('Alice:');
            console.log('Private Key:', alice.toWIF());
            console.log('Public Key:', alice.publicKey.toString('hex'));
            console.log('\nBob:');
            console.log('Private Key:', bob.toWIF());
            console.log('Public Key:', bob.publicKey.toString('hex'));

            // Create funding transaction (2-of-2 multisig)
            const fundingTx = this.createFundingTransaction(
                alice.publicKey,
                bob.publicKey,
                1000000 // 0.01 BTC in satoshis
            );

            console.log('\nFunding Transaction:');
            console.log('===================');
            console.log('Multisig Address:', fundingTx.address);
            console.log('Witness Script:', fundingTx.witnessScript);
            console.log('Amount:', fundingTx.fundingAmount, 'satoshis');

            // Create initial commitment transaction
            const channelState = {
                alicePubkey: alice.publicKey,
                bobPubkey: bob.publicKey,
                aliceBalance: 600000, // 0.006 BTC
                bobBalance: 400000    // 0.004 BTC
            };

            const commitmentTx = this.createCommitmentTransaction(channelState);

            console.log('\nInitial Commitment Transaction:');
            console.log('============================');
            console.log('Alice Balance:', channelState.aliceBalance, 'satoshis');
            console.log('Bob Balance:', channelState.bobBalance, 'satoshis');
            console.log('Total:', commitmentTx.totalAmount, 'satoshis');

            return {
                alice,
                bob,
                fundingTx,
                commitmentTx
            };
        } catch (error) {
            console.error('Channel demonstration failed:', error.message);
            throw error;
        }
    }
}

async function main() {
    try {
        const ln = new LightningNetwork('mainnet');
        await ln.demonstrateChannel();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = LightningNetwork;