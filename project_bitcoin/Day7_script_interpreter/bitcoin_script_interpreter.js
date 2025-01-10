const bitcoin = require('bitcoinjs-lib');
const ECPair = require('ecpair').ECPairFactory(require('tiny-secp256k1'));
const crypto = require('crypto');

class BitcoinScriptInterpreter {
    constructor() {
        this.stack = [];
    }

    execute(script) {
        for (const op of script) {
            if (typeof op === 'string' || typeof op === 'number') {
                this.stack.push(op);
            } else {
                op(this.stack);
            }
        }
        return this.stack;
    }

    // Example operations
    static OP_DUP(stack) {
        const top = stack[stack.length - 1];
        stack.push(top);
    }

    static OP_HASH160(stack) {
        // In real Bitcoin, this would perform RIPEMD160(SHA256(x))
        const top = stack.pop();
        stack.push(`HASH160(${top})`);
    }

    static OP_EQUALVERIFY(stack) {
        const b = stack.pop();
        const a = stack.pop();
        if (a !== b) throw new Error('OP_EQUALVERIFY failed');
    }

    static OP_CHECKSIG(stack) {
        const pubKey = stack.pop();
        const sig = stack.pop();
        // In real Bitcoin, this would verify the signature
        stack.push(true);
    }

    static hash160(buffer) {
        return bitcoin.crypto.ripemd160(bitcoin.crypto.sha256(buffer));
    }
}

// Create a real P2PKH example
async function demonstrateP2PKH() {
    try {
        // Generate a key pair
        const keyPair = ECPair.makeRandom();
        const publicKey = keyPair.publicKey;
        
        // Create a proper message hash
        const message = Buffer.from('Hello, Bitcoin!');
        const messageHash = crypto.createHash('sha256').update(message).digest();
        
        // Sign the message hash
        const signature = keyPair.sign(messageHash);
        
        // Calculate public key hash
        const pubKeyHash = BitcoinScriptInterpreter.hash160(publicKey);

        console.log('\nReal P2PKH Example:');
        console.log('===================');
        console.log('Public Key:', publicKey.toString('hex'));
        console.log('Public Key Hash:', pubKeyHash.toString('hex'));
        console.log('Signature:', signature.toString('hex'));

        const interpreter = new BitcoinScriptInterpreter();
        
        // P2PKH script pattern
        const script = [
            signature,              // Push signature
            publicKey,             // Push public key
            BitcoinScriptInterpreter.OP_DUP,
            BitcoinScriptInterpreter.OP_HASH160,
            pubKeyHash,            // Push actual public key hash
            BitcoinScriptInterpreter.OP_EQUALVERIFY,
            BitcoinScriptInterpreter.OP_CHECKSIG
        ];

        const result = interpreter.execute(script);
        console.log('Script execution successful');
        console.log('Final stack:', result);
    } catch (error) {
        console.log('Script failed:', error.message);
    }
}

// Example arithmetic operations
function demonstrateArithmetic() {
    console.log('\nArithmetic Operations:');
    console.log('=====================');
    const interpreter = new BitcoinScriptInterpreter();
    
    const script = [
        2,                          // Push 2
        3,                          // Push 3
        (stack) => {                // OP_ADD
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a + b);
        }
    ];

    const result = interpreter.execute(script);
    console.log('2 + 3 =', result[0]);
}

// Example conditional logic
function demonstrateConditional() {
    console.log('\nConditional Logic:');
    console.log('=================');
    const interpreter = new BitcoinScriptInterpreter();
    
    const script = [
        5,                          // Push 5
        3,                          // Push 3
        (stack) => {                // OP_IF
            const condition = stack.pop();
            const value = stack.pop();
            if (condition > 0) {
                stack.push(value + 2);
            } else {
                stack.push(value - 2);
            }
        }
    ];

    const result = interpreter.execute(script);
    console.log('Result:', result[0]);
}

async function main() {
    await demonstrateP2PKH();
    demonstrateArithmetic();
    demonstrateConditional();
}

main().catch(console.error);