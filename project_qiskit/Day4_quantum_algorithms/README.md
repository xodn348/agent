# Day 4: Quantum Algorithms

Implementation of fundamental quantum algorithms using Qiskit.

## Algorithms Implemented

1. Deutsch-Jozsa Algorithm
   - Quantum parallelism demonstration
   - Constant vs balanced functions
   - Single-query solution

2. Grover's Search Algorithm
   - Quadratic speedup for search
   - Oracle implementation
   - Amplitude amplification

3. Quantum Fourier Transform
   - Efficient quantum implementation
   - Phase estimation basis
   - Register swapping

4. Phase Estimation
   - Eigenvalue estimation
   - QFT application
   - Precision control

## Setup

```bash
pip install qiskit matplotlib numpy
```

## Usage

```python
from quantum_algorithms import QuantumAlgorithms

qa = QuantumAlgorithms()

# Run Deutsch-Jozsa
qa.deutsch_jozsa_algorithm('balanced')

# Run Grover's Search
qa.grover_algorithm('101')
```

## Implementation Details

1. Deutsch-Jozsa:
   - Oracle implementation
   - Quantum parallelism
   - One-shot measurement

2. Grover's Algorithm:
   - Oracle construction
   - Diffusion operator
   - Optimal iterations

3. QFT:
   - Efficient circuit construction
   - Phase rotations
   - Register swapping

4. Phase Estimation:
   - Controlled operations
   - Inverse QFT
   - Measurement interpretation