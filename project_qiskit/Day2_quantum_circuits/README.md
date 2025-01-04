# Day 2: Quantum Circuit Implementations

Basic and advanced quantum circuit implementations using Qiskit.

## Features

1. Bell State Creation
   - Two-qubit entanglement
   - Basic quantum measurements

2. GHZ State
   - Three-qubit entanglement
   - Multi-qubit operations

3. Quantum Teleportation
   - Complete protocol implementation
   - Bell pair creation
   - Measurement and corrections

4. Phase Kickback
   - Controlled operations
   - Phase rotations

5. Quantum Fourier Transform
   - Multi-qubit implementation
   - Phase estimation basis

## Setup

```bash
pip install qiskit matplotlib numpy
```

## Usage

```python
from quantum_circuits import QuantumCircuitBasics

# Create instance
qc = QuantumCircuitBasics()

# Run examples
bell_circuit, counts = qc.create_bell_state()
ghz_circuit, counts = qc.create_ghz_state()
```

## Circuit Details

1. Bell State:
   - Hadamard gate
   - CNOT gate
   - Measurement

2. GHZ State:
   - Three-qubit entanglement
   - Multiple CNOT gates

3. Teleportation:
   - Bell state preparation
   - Bell measurement
   - Correction operations

4. Phase Kickback:
   - Controlled phase rotations
   - Eigenstate preparation

5. QFT:
   - Hadamard layer
   - Controlled phase rotations
   - Qubit ordering