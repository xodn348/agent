class BTCScriptInterpreter {
    constructor() {
        this.stack = [];
        this.altStack = [];
        this.initializeOpcodes();
    }

    initializeOpcodes() {
        // Arithmetic operations
        this.opcodes = {
            // Stack operations
            'OP_DUP': () => {
                if (this.stack.length < 1) throw new Error('Stack underflow');
                const value = this.stack[this.stack.length - 1];
                this.stack.push(value);
            },
            'OP_DROP': () => {
                if (this.stack.length < 1) throw new Error('Stack underflow');
                this.stack.pop();
            },
            'OP_SWAP': () => {
                if (this.stack.length < 2) throw new Error('Stack underflow');
                const a = this.stack.pop();
                const b = this.stack.pop();
                this.stack.push(a);
                this.stack.push(b);
            },

            // Arithmetic
            'OP_ADD': () => {
                if (this.stack.length < 2) throw new Error('Stack underflow');
                const b = this.popNumber();
                const a = this.popNumber();
                this.stack.push(a + b);
            },
            'OP_SUB': () => {
                if (this.stack.length < 2) throw new Error('Stack underflow');
                const b = this.popNumber();
                const a = this.popNumber();
                this.stack.push(a - b);
            },

            // Boolean logic
            'OP_EQUAL': () => {
                if (this.stack.length < 2) throw new Error('Stack underflow');
                const b = this.stack.pop();
                const a = this.stack.pop();
                this.stack.push(a === b ? 1 : 0);
            },
            'OP_VERIFY': () => {
                if (this.stack.length < 1) throw new Error('Stack underflow');
                const value = this.popNumber();
                if (value === 0) throw new Error('Script verification failed');
            },
            'OP_EQUALVERIFY': () => {
                this.executeOpcode('OP_EQUAL');
                this.executeOpcode('OP_VERIFY');
            },

            // Cryptographic
            'OP_HASH160': () => {
                if (this.stack.length < 1) throw new Error('Stack underflow');
                const value = this.stack.pop();
                // In real implementation, this would perform RIPEMD160(SHA256(value))
                this.stack.push(`HASH160(${value})`);
            },
            'OP_CHECKSIG': () => {
                if (this.stack.length < 2) throw new Error('Stack underflow');
                const pubKey = this.stack.pop();
                const sig = this.stack.pop();
                // In real implementation, this would verify the signature
                this.stack.push(`CHECKSIG(${sig},${pubKey})`);
            },

            // Flow control
            'OP_IF': () => {
                if (this.stack.length < 1) throw new Error('Stack underflow');
                return this.popNumber() !== 0;
            },
            'OP_ELSE': () => {
                // Handled in executeScript
            },
            'OP_ENDIF': () => {
                // Handled in executeScript
            },

            // Constants
            'OP_0': () => this.stack.push(0),
            'OP_1': () => this.stack.push(1),
            'OP_2': () => this.stack.push(2),
            'OP_3': () => this.stack.push(3),
            'OP_4': () => this.stack.push(4),
            'OP_5': () => this.stack.push(5),
        };
    }

    popNumber() {
        const value = this.stack.pop();
        if (typeof value === 'number') return value;
        throw new Error('Expected number on stack');
    }

    executeOpcode(opcode, ...args) {
        if (!this.opcodes[opcode]) {
            throw new Error(`Unknown opcode: ${opcode}`);
        }
        return this.opcodes[opcode](...args);
    }

    parseScript(scriptString) {
        return scriptString.split(' ').filter(token => token.length > 0);
    }

    executeScript(scriptString) {
        const tokens = this.parseScript(scriptString);
        let i = 0;

        while (i < tokens.length) {
            const token = tokens[i];

            // Handle flow control
            if (token === 'OP_IF') {
                i++;
                const condition = this.executeOpcode('OP_IF');
                const ifClause = [];
                const elseClause = [];
                let depth = 1;
                let inElse = false;

                while (depth > 0 && i < tokens.length) {
                    if (tokens[i] === 'OP_IF') depth++;
                    if (tokens[i] === 'OP_ENDIF') depth--;
                    if (depth === 1 && tokens[i] === 'OP_ELSE') {
                        inElse = true;
                    } else if (depth > 0) {
                        if (inElse) {
                            elseClause.push(tokens[i]);
                        } else {
                            ifClause.push(tokens[i]);
                        }
                    }
                    i++;
                }

                this.executeScript(condition ? ifClause.join(' ') : elseClause.join(' '));
                continue;
            }

            // Handle regular opcodes and push operations
            if (token.startsWith('OP_')) {
                this.executeOpcode(token);
            } else {
                // Push value to stack
                const value = !isNaN(token) ? parseInt(token) : token;
                this.stack.push(value);
            }

            i++;
        }

        return this.stack;
    }

    // Helper method to see stack state
    getStack() {
        return [...this.stack];
    }

    // Helper method to clear stack
    clearStack() {
        this.stack = [];
        this.altStack = [];
    }
}

// Example usage
function main() {
    const interpreter = new BTCScriptInterpreter();

    // Example 1: Simple P2PKH script pattern
    console.log('\nExample 1: P2PKH Script Pattern');
    const p2pkhScript = 'OP_DUP OP_HASH160 pubKeyHash OP_EQUALVERIFY OP_CHECKSIG';
    try {
        interpreter.clearStack();
        interpreter.stack.push('signature');
        interpreter.stack.push('publicKey');
        console.log('Initial stack:', interpreter.getStack());
        interpreter.executeScript(p2pkhScript);
        console.log('Final stack:', interpreter.getStack());
    } catch (error) {
        console.error('Script failed:', error.message);
    }

    // Example 2: Arithmetic operations
    console.log('\nExample 2: Arithmetic Operations');
    const arithmeticScript = '3 4 OP_ADD 2 OP_SUB';
    try {
        interpreter.clearStack();
        interpreter.executeScript(arithmeticScript);
        console.log('Result:', interpreter.getStack());
    } catch (error) {
        console.error('Script failed:', error.message);
    }

    // Example 3: Conditional logic
    console.log('\nExample 3: Conditional Logic');
    const conditionalScript = '1 OP_IF 3 4 OP_ADD OP_ELSE 3 4 OP_SUB OP_ENDIF';
    try {
        interpreter.clearStack();
        interpreter.executeScript(conditionalScript);
        console.log('Result:', interpreter.getStack());
    } catch (error) {
        console.error('Script failed:', error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = BTCScriptInterpreter;