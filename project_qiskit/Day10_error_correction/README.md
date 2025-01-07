# Quantum Error Correction

Implementation of various quantum error correction codes using Qiskit.

## Features

1. Bit Flip Code
   - Three-qubit encoding
   - Error detection
   - Error correction

2. Phase Flip Code
   - Three-qubit encoding
   - Phase error protection
   - Hadamard basis correction

3. Shor Code
   - Nine-qubit protection
   - Combined bit and phase protection
   - Full error correction

4. Steane Code
   - Seven-qubit code
   - CSS code structure
   - Syndrome measurement

## Setup

```bash
pip install qiskit matplotlib numpy
```

## Usage

```python
from quantum_error_correction import QuantumErrorCorrection

qec = QuantumErrorCorrection()

# Test bit flip code
qec.bit_flip_code()

# Test Shor code
qec.shor_code('bit', 4)  # With bit flip error
```

## Technical Details

1. Bit Flip Code:
   - Three-qubit redundant encoding
   - Majority vote correction
   - CNOT-based syndrome extraction

2. Phase Flip Code:
   - Hadamard basis encoding
   - Z-error protection
   - Phase error detection

3. Shor Code:
   - Concatenated code
   - Full quantum error protection
   - Nine-qubit implementation

4. Steane Code:
   - CSS code construction
   - Efficient seven-qubit encoding
   - Transversal gates