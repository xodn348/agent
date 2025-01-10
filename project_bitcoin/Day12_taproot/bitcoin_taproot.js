const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const { ECPairFactory } = require('ecpair');
const ECPair = ECPairFactory(ecc);

class BitcoinTaproot {
    constructor(network = 'testnet') {
        this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
    }

    generateTaprootKeyPair() {
        // Generate key pair for Taproot
        const keyPair = ECPair.makeRandom({ network: this.network });
        return {
            privateKey: keyPair.toWIF(),
            publicKey: keyPair.publicKey.toString('hex'),
            keyPair
        };
    }

    createTaprootAddress(publicKey, scriptTree = null) {
        try {
            // Create Taproot payment object
            const taprootPayment = bitcoin.payments.p2tr({
                pubkey: Buffer.from(publicKey, 'hex'),
                scriptTree,
                network: this.network
            });

            return {
                address: taprootPayment.address,
                output: taprootPayment.output.toString('hex'),
                witness: scriptTree ? 'Script path spending enabled' : 'Key path spending only'
            };
        } catch (error) {
            throw new Error(`Error creating Taproot address: ${error.message}`);
        }
    }

    createScriptTree(scripts) {
        try {
            // Create leaf scripts for Taproot script tree
            const leaves = scripts.map(script => {
                return {
                    script: Buffer.from(script, 'hex'),
                    version: 0xc0  // Tapscript version
                };
            });

            return bitcoin.payments.p2tr.tree.sortScripts(leaves);
        } catch (error) {
            throw new Error(`Error creating script tree: ${error.message}`);
        }
    }

    createTaprootSpend(utxo, recipient, amount, keyPair, scriptPath = false, script = null) {
        try {
            const psbt = new bitcoin.Psbt({ network: this.network });

            // Add input
            const input = {
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: Buffer.from(utxo.script, 'hex'),
                    value: utxo.value
                }
            };

            if (scriptPath && script) {
                // Add script path spending details
                input.tapLeafScript = [
                    {
                        leafVersion: 0xc0,
                        script: Buffer.from(script, 'hex'),
                        controlBlock: this.createControlBlock(script)
                    }
                ];
            } else {
                // Key path spending
                input.tapInternalKey = keyPair.publicKey;
            }

            psbt.addInput(input);

            // Add output
            psbt.addOutput({
                address: recipient,
                value: amount
            });

            // Sign transaction
            psbt.signInput(0, keyPair);
            psbt.finalizeAllInputs();

            // Extract transaction
            const tx = psbt.extractTransaction();

            return {
                txHex: tx.toHex(),
                txId: tx.getId(),
                scriptPath: scriptPath
            };
        } catch (error) {
            throw new Error(`Error creating Taproot spend: ${error.message}`);
        }
    }

    createControlBlock(script) {
        try {
            // Create control block for script path spending
            const leafHash = bitcoin.crypto.taggedHash('TapLeaf', 
                Buffer.concat([Buffer.from([0xc0]), Buffer.from(script, 'hex')]));

            return Buffer.concat([
                Buffer.from([0xc0]),  // Leaf version
                leafHash
            ]);
        } catch (error) {
            throw new Error(`Error creating control block: ${error.message}`);
        }
    }

    verifyTaprootSignature(tx, input, pubKey) {
        try {
            // Verify Taproot signature
            const signatureHash = tx.hashForWitnessV1(
                input.index,
                [input.witnessUtxo.script],
                [input.witnessUtxo.value],
                bitcoin.Transaction.SIGHASH_ALL
            );

            return bitcoin.crypto.verifySchnorr(
                signatureHash,
                pubKey,
                input.tapScriptSig[0].signature
            );
        } catch (error) {
            throw new Error(`Error verifying Taproot signature: ${error.message}`);
        }
    }

    displayTaprootDetails(address) {
        try {
            console.log('\nTaproot Address Details:');
            console.log('======================');
            console.log(`Address: ${address.address}`);
            console.log(`Output Script: ${address.output}`);
            console.log(`Spending Path: ${address.witness}`);
            return address;
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

// Example usage
async function main() {
    const taproot = new BitcoinTaproot('testnet');

    try {
        // Generate Taproot key pair
        const keyPair = taproot.generateTaprootKeyPair();
        console.log('\nGenerated Key Pair:', keyPair);

        // Create basic Taproot address (key path spending)
        const keyPathAddress = taproot.createTaprootAddress(keyPair.publicKey);
        taproot.displayTaprootDetails(keyPathAddress);

        // Create script tree for script path spending
        const scriptTree = taproot.createScriptTree([
            // Example script: OP_1
            '51',
            // Example script: OP_DROP OP_TRUE
            '7551'
        ]);

        // Create Taproot address with script tree
        const scriptPathAddress = taproot.createTaprootAddress(keyPair.publicKey, scriptTree);
        taproot.displayTaprootDetails(scriptPathAddress);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BitcoinTaproot;