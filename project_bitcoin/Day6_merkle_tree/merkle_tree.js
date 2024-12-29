const crypto = require('crypto');

class MerkleTree {
    constructor(transactions) {
        this.transactions = transactions;
        this.tree = this.buildTree();
    }

    // Calculate hash of data using SHA256
    hash(data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // Combine and hash two hashes
    combineHashes(hash1, hash2) {
        // Sort hashes to ensure consistent ordering
        const concatenatedHash = [hash1, hash2].sort().join('');
        return this.hash(concatenatedHash);
    }

    // Build the Merkle Tree
    buildTree() {
        // Hash all transactions
        let nodes = this.transactions.map(tx => this.hash(tx));
        this.levels = [nodes];

        // Build tree until we reach the root
        while (nodes.length > 1) {
            const levelUp = [];
            for (let i = 0; i < nodes.length; i += 2) {
                const left = nodes[i];
                const right = (i + 1 < nodes.length) ? nodes[i + 1] : left;
                levelUp.push(this.combineHashes(left, right));
            }
            nodes = levelUp;
            this.levels.push(nodes);
        }

        return nodes[0]; // Root hash
    }

    // Get Merkle proof for a transaction
    getProof(transaction) {
        const txHash = this.hash(transaction);
        let index = this.levels[0].indexOf(txHash);
        
        if (index === -1) {
            throw new Error('Transaction not found in Merkle Tree');
        }

        const proof = [];
        for (let i = 0; i < this.levels.length - 1; i++) {
            const level = this.levels[i];
            const isLeft = index % 2 === 0;
            const pairIndex = isLeft ? index + 1 : index - 1;

            if (pairIndex < level.length) {
                proof.push({
                    position: isLeft ? 'right' : 'left',
                    hash: level[pairIndex]
                });
            }

            index = Math.floor(index / 2);
        }

        return proof;
    }

    // Verify a Merkle proof
    verifyProof(transaction, proof) {
        let hash = this.hash(transaction);

        for (const node of proof) {
            if (node.position === 'left') {
                hash = this.combineHashes(node.hash, hash);
            } else {
                hash = this.combineHashes(hash, node.hash);
            }
        }

        return hash === this.tree;
    }

    // Print the tree structure
    printTree() {
        console.log('\nMerkle Tree Structure:');
        this.levels.forEach((level, index) => {
            console.log(`\nLevel ${index}:`);
            level.forEach(hash => {
                console.log(hash.substring(0, 16) + '...');
            });
        });
        console.log('\nRoot Hash:', this.tree);
    }

    // Get root hash
    getRootHash() {
        return this.tree;
    }

    // Get all levels of the tree
    getLevels() {
        return this.levels;
    }
}

// Example usage
function main() {
    // Sample transactions
    const transactions = [
        { from: 'Alice', to: 'Bob', amount: 50 },
        { from: 'Bob', to: 'Charlie', amount: 30 },
        { from: 'Charlie', to: 'David', amount: 20 },
        { from: 'David', to: 'Eve', amount: 10 }
    ];

    // Create Merkle Tree
    const merkleTree = new MerkleTree(transactions);
    
    // Print tree structure
    merkleTree.printTree();

    // Get and verify proof for a transaction
    const targetTx = transactions[1]; // Bob to Charlie transaction
    console.log('\nVerifying transaction:', targetTx);

    const proof = merkleTree.getProof(targetTx);
    console.log('\nMerkle Proof:', proof);

    const isValid = merkleTree.verifyProof(targetTx, proof);
    console.log('\nProof verification:', isValid ? 'Valid' : 'Invalid');

    // Try to verify with modified transaction
    const modifiedTx = { ...targetTx, amount: 40 };
    const isValidModified = merkleTree.verifyProof(modifiedTx, proof);
    console.log('Modified transaction verification:', isValidModified ? 'Valid' : 'Invalid');
}

if (require.main === module) {
    main();
}

module.exports = MerkleTree;