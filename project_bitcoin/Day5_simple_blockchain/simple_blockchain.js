const crypto = require('crypto');

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return crypto.createHash('sha256')
            .update(this.previousHash + 
                    this.timestamp + 
                    JSON.stringify(this.transactions) + 
                    this.nonce)
            .digest('hex');
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log('Block mined:', this.hash);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(Date.parse('2024-12-26'), [], '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTx = {
            fromAddress: null,
            toAddress: miningRewardAddress,
            amount: this.miningReward
        };
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.amount || transaction.amount <= 0) {
            throw new Error('Transaction amount should be greater than 0');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    displayChain() {
        console.log('\nBlockchain:');
        this.chain.forEach((block, index) => {
            console.log(`\nBlock ${index}:`);
            console.log('Timestamp:', new Date(block.timestamp));
            console.log('Transactions:', JSON.stringify(block.transactions, null, 2));
            console.log('Previous Hash:', block.previousHash);
            console.log('Hash:', block.hash);
            console.log('Nonce:', block.nonce);
        });
    }
}

// Example usage
function main() {
    const myBlockchain = new Blockchain();
    console.log('Mining first block...');

    // Add some transactions
    myBlockchain.addTransaction({
        fromAddress: 'Alice',
        toAddress: 'Bob',
        amount: 50
    });

    myBlockchain.addTransaction({
        fromAddress: 'Bob',
        toAddress: 'Charlie',
        amount: 30
    });

    // Mine block
    console.log('\nStarting the miner...');
    myBlockchain.minePendingTransactions('miner-address');

    // Display chain
    myBlockchain.displayChain();

    // Check balances
    console.log('\nBalances:');
    console.log('Alice:', myBlockchain.getBalanceOfAddress('Alice'));
    console.log('Bob:', myBlockchain.getBalanceOfAddress('Bob'));
    console.log('Charlie:', myBlockchain.getBalanceOfAddress('Charlie'));
    console.log('Miner:', myBlockchain.getBalanceOfAddress('miner-address'));

    // Validate chain
    console.log('\nIs blockchain valid?', myBlockchain.isChainValid());
}

if (require.main === module) {
    main();
}

module.exports = { Block, Blockchain };