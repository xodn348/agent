# Qiskit Project Daily Log

## December 2024

### [Day 2: Quantum Measurements](Day2_quantum_measurement/) - 2024-12-29

#### Overview
Implemented quantum measurement concepts and error mitigation techniques.

#### Features Implemented
- Single qubit measurements
- Different measurement bases (X, Y, Z)
- Error mitigation techniques
- Projective measurements
- Noise modeling and calibration

#### Technical Details
- Used Qiskit's QASM simulator
- Implemented noise models
- Error mitigation filters
- Measurement basis transformations

#### Files
- `quantum_measurement.py`: Main implementation
- `README.md`: Usage instructions

#### Usage Example
```python
from quantum_measurement import QuantumMeasurement

qm = QuantumMeasurement()
results = qm.single_qubit_measurement()
```

#### Dependencies
- qiskit
- qiskit-aer
- qiskit-ignis
- numpy

---

### [Day 1: Quantum Computing Basics](Day1_quantum_basics/) - 2024-12-28

#### Overview
Implemented fundamental quantum computing concepts using Qiskit.

#### Features Implemented
- Basic quantum gates (X, H, CNOT)
- Bell state creation
- Quantum superposition
- Rotation gates

---