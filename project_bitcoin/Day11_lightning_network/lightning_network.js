const bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');

class LightningNetwork {
    constructor(network = 'testnet') {
        this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
        this.channels = new Map();
        this.payments = new Map();
    }

    createPaymentChannel(channelId, fundingAmount, funderPubKey, recipientPubKey) {
        try {
            // Create channel structure
            const channel = {
                id: channelId,
                state: 'initialized',
                fundingTx: null,
                commitmentTxs: [],
                balance: {
                    funder: fundingAmount,
                    recipient: 0
                },
                sequence: 0,
                htlcs: new Map(),
                keys: {
                    funder: funderPubKey,
                    recipient: recipientPubKey
                }
            };

            this.channels.set(channelId, channel);
            return channel;
        } catch (error) {
            throw new Error(`Error creating payment channel: ${error.message}`);
        }
    }

    async createFundingTransaction(channel, fundingAmount) {
        try {
            // Create 2-of-2 multisig address
            const multisigScript = bitcoin.payments.p2ms({
                m: 2,
                pubkeys: [Buffer.from(channel.keys.funder, 'hex'), Buffer.from(channel.keys.recipient, 'hex')],
                network: this.network
            });

            // Wrap in P2WSH
            const p2wsh = bitcoin.payments.p2wsh({
                redeem: multisigScript,
                network: this.network
            });

            // Create funding transaction
            const fundingTx = {
                address: p2wsh.address,
                amount: fundingAmount,
                redeemScript: multisigScript.output.toString('hex'),
                witnessScript: multisigScript.output.toString('hex')
            };

            channel.fundingTx = fundingTx;
            channel.state = 'funded';

            return fundingTx;
        } catch (error) {
            throw new Error(`Error creating funding transaction: ${error.message}`);
        }
    }

    createCommitmentTransaction(channel, balanceFunder, balanceRecipient) {
        try {
            // Create commitment transaction structure
            const commitmentTx = {
                sequence: channel.sequence++,
                timestamp: Date.now(),
                balances: {
                    funder: balanceFunder,
                    recipient: balanceRecipient
                },
                revocationKey: crypto.randomBytes(32).toString('hex'),
                htlcs: Array.from(channel.htlcs.values())
            };

            channel.commitmentTxs.push(commitmentTx);
            return commitmentTx;
        } catch (error) {
            throw new Error(`Error creating commitment transaction: ${error.message}`);
        }
    }

    async createHTLC(channel, amount, preimageHash, timelock) {
        try {
            // Create HTLC structure
            const htlc = {
                id: crypto.randomBytes(32).toString('hex'),
                amount: amount,
                preimageHash: preimageHash,
                timelock: timelock,
                status: 'pending',
                timestamp: Date.now()
            };

            // Add HTLC to channel
            channel.htlcs.set(htlc.id, htlc);

            // Update channel balance
            channel.balance.funder -= amount;
            channel.balance.recipient += amount;

            // Create new commitment transaction
            this.createCommitmentTransaction(
                channel,
                channel.balance.funder,
                channel.balance.recipient
            );

            return htlc;
        } catch (error) {
            throw new Error(`Error creating HTLC: ${error.message}`);
        }
    }

    async fulfillHTLC(channel, htlcId, preimage) {
        try {
            const htlc = channel.htlcs.get(htlcId);
            if (!htlc) throw new Error('HTLC not found');

            // Verify preimage
            const calculatedHash = crypto
                .createHash('sha256')
                .update(preimage)
                .digest('hex');

            if (calculatedHash !== htlc.preimageHash) {
                throw new Error('Invalid preimage');
            }

            // Update HTLC status
            htlc.status = 'fulfilled';
            htlc.preimage = preimage;
            htlc.fulfillmentTime = Date.now();

            // Create new commitment transaction
            this.createCommitmentTransaction(
                channel,
                channel.balance.funder,
                channel.balance.recipient
            );

            return htlc;
        } catch (error) {
            throw new Error(`Error fulfilling HTLC: ${error.message}`);
        }
    }

    async closeChannel(channel, cooperative = true) {
        try {
            if (cooperative) {
                // Create cooperative closing transaction
                const closingTx = {
                    type: 'cooperative',
                    timestamp: Date.now(),
                    finalBalances: {
                        funder: channel.balance.funder,
                        recipient: channel.balance.recipient
                    },
                    htlcs: Array.from(channel.htlcs.values())
                };

                channel.state = 'closed';
                return closingTx;
            } else {
                // Create force closing transaction using latest commitment
                const latestCommitment = channel.commitmentTxs[channel.commitmentTxs.length - 1];
                const forcedClosingTx = {
                    type: 'force',
                    timestamp: Date.now(),
                    commitmentTx: latestCommitment,
                    htlcs: Array.from(channel.htlcs.values())
                };

                channel.state = 'force_closing';
                return forcedClosingTx;
            }
        } catch (error) {
            throw new Error(`Error closing channel: ${error.message}`);
        }
    }

    getChannelState(channelId) {
        const channel = this.channels.get(channelId);
        if (!channel) throw new Error('Channel not found');

        return {
            id: channel.id,
            state: channel.state,
            balance: channel.balance,
            commitmentCount: channel.commitmentTxs.length,
            htlcCount: channel.htlcs.size,
            lastUpdate: channel.commitmentTxs[channel.commitmentTxs.length - 1]?.timestamp
        };
    }

    displayChannelInfo(channelId) {
        try {
            const channel = this.channels.get(channelId);
            if (!channel) throw new Error('Channel not found');

            console.log('\nChannel Information:');
            console.log('===================');
            console.log(`Channel ID: ${channel.id}`);
            console.log(`State: ${channel.state}`);
            console.log('\nBalances:');
            console.log(`Funder: ${channel.balance.funder} satoshis`);
            console.log(`Recipient: ${channel.balance.recipient} satoshis`);
            console.log(`\nCommitment Transactions: ${channel.commitmentTxs.length}`);
            console.log(`Active HTLCs: ${channel.htlcs.size}`);

            if (channel.htlcs.size > 0) {
                console.log('\nActive HTLCs:');
                channel.htlcs.forEach((htlc, id) => {
                    console.log(`\nHTLC ${id.substr(0, 8)}...`);
                    console.log(`Amount: ${htlc.amount} satoshis`);
                    console.log(`Status: ${htlc.status}`);
                    console.log(`Created: ${new Date(htlc.timestamp).toISOString()}`);
                });
            }

            return channel;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

// Example usage
async function main() {
    const ln = new LightningNetwork('testnet');

    try {
        // Create channel
        const channelId = crypto.randomBytes(32).toString('hex');
        const funderPubKey = 'funder_public_key';
        const recipientPubKey = 'recipient_public_key';
        const fundingAmount = 1000000; // 0.01 BTC in satoshis

        // Create and fund channel
        const channel = ln.createPaymentChannel(channelId, fundingAmount, funderPubKey, recipientPubKey);
        await ln.createFundingTransaction(channel, fundingAmount);

        // Create HTLC
        const preimage = crypto.randomBytes(32);
        const preimageHash = crypto
            .createHash('sha256')
            .update(preimage)
            .digest('hex');

        const htlc = await ln.createHTLC(channel, 50000, preimageHash, 144); // 144 blocks timelock
        console.log('Created HTLC:', htlc);

        // Fulfill HTLC
        await ln.fulfillHTLC(channel, htlc.id, preimage);

        // Display channel info
        ln.displayChannelInfo(channelId);

        // Close channel
        const closingTx = await ln.closeChannel(channel, true);
        console.log('\nChannel closed:', closingTx);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = LightningNetwork;