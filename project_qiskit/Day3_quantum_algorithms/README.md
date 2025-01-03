# Day 3: Quantum Algorithms

Implementation of fundamental quantum algorithms using Qiskit.

## Algorithms Implemented

1. Deutsch-Jozsa Algorithm
   - Determines if function is constant or balanced
   - Demonstrates quantum parallelism
   - Both constant and balanced oracles

2. Grover's Search Algorithm
   - Quantum search in unstructured database
   - Quadratic speedup over classical search
   - Configurable marked state

3. Quantum Fourier Transform
   - Fundamental quantum transformation
   - Basis for many quantum algorithms
   - Efficient implementation

4. Phase Estimation
   - Estimates eigenvalues of unitary operators
   - Used in many quantum algorithms
   - Demonstrates quantum parallelism

## Setup

```bash
pip install qiskit matplotlib numpy
```

## Usage

Run all examples:
```bash
python quantum_algorithms.py
```

Or use specific algorithms:
```python
from quantum_algorithms import QuantumAlgorithms

qa = QuantumAlgorithms()

# Run Deutsch-Jozsa
qa.deutsch_jozsa_algorithm('constant')

# Run Grover's search
qa.grover_algorithm('11')

# Run QFT
qa.quantum_fourier_transform(3)

# Run Phase Estimation
qa.phase_estimation(np.pi/4)
```

## Technical Details

1. Deutsch-Jozsa
   - Uses 1 query qubit + 1 auxiliary qubit
   - Demonstrates quantum parallelism
   - Single-shot determination

2. Grover's Algorithm
   - 2-qubit implementation
   - Optimal number of iterations
   - Amplitude amplification

3. QFT
   - n-qubit implementation
   - Includes optional swap network
   - Efficient phase rotations

4. Phase Estimation
   - Uses inverse QFT
   - Controlled phase rotations
   - Binary fraction output