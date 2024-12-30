from qiskit import QuantumCircuit, Aer, execute
from qiskit.visualization import plot_histogram
import numpy as np

class QuantumBasics:
    def __init__(self):
        self.simulator = Aer.get_backend('qasm_simulator')

    def create_bell_state(self):
        """Create a Bell state (maximally entangled state)"""
        # Create circuit with 2 qubits and 2 classical bits
        qc = QuantumCircuit(2, 2)

        # Create superposition with Hadamard gate
        qc.h(0)
        # Entangle qubits with CNOT gate
        qc.cx(0, 1)
        # Measure both qubits
        qc.measure([0,1], [0,1])

        print('Bell State Circuit:')
        print(qc)

        # Execute the circuit
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

    def quantum_superposition(self):
        """Demonstrate quantum superposition"""
        qc = QuantumCircuit(1, 1)
        
        # Create superposition
        qc.h(0)
        qc.measure(0, 0)

        print('\nSuperposition Circuit:')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

    def quantum_rotation(self, angle):
        """Demonstrate rotation gates"""
        qc = QuantumCircuit(1, 1)
        
        # Apply rotation around X-axis
        qc.rx(angle, 0)
        qc.measure(0, 0)

        print(f'\nRotation Circuit (angle: {angle:.2f}):')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

    def basic_gates_demo(self):
        """Demonstrate basic quantum gates"""
        qc = QuantumCircuit(3, 3)

        # X gate (NOT gate)
        qc.x(0)
        # Hadamard gate
        qc.h(1)
        # CNOT gate
        qc.cx(1, 2)
        # Measure all qubits
        qc.measure([0,1,2], [0,1,2])

        print('\nBasic Gates Circuit:')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

def main():
    qb = QuantumBasics()

    # 1. Create Bell State
    print('\n=== Bell State Example ===')
    qb.create_bell_state()

    # 2. Demonstrate Superposition
    print('\n=== Superposition Example ===')
    qb.quantum_superposition()

    # 3. Demonstrate Rotation
    print('\n=== Rotation Example ===')
    qb.quantum_rotation(np.pi/4)

    # 4. Demonstrate Basic Gates
    print('\n=== Basic Gates Example ===')
    qb.basic_gates_demo()

if __name__ == '__main__':
    main()