from qiskit import QuantumCircuit, Aer, execute
from qiskit.visualization import plot_histogram, plot_bloch_multivector
from qiskit.quantum_info import Statevector
import numpy as np

class QuantumCircuitBasics:
    def __init__(self):
        self.simulator = Aer.get_backend('qasm_simulator')
        self.statevector_sim = Aer.get_backend('statevector_simulator')

    def create_bell_state(self):
        """Create a Bell state (maximally entangled state)"""
        qc = QuantumCircuit(2, 2)
        qc.h(0)
        qc.cx(0, 1)
        qc.measure([0,1], [0,1])

        print('Bell State Circuit:')
        print(qc)

        # Execute and get counts
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

    def create_ghz_state(self):
        """Create a GHZ state (three-qubit entangled state)"""
        qc = QuantumCircuit(3, 3)
        qc.h(0)
        qc.cx(0, 1)
        qc.cx(1, 2)
        qc.measure([0,1,2], [0,1,2])

        print('\nGHZ State Circuit:')
        print(qc)

        # Execute and get counts
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

    def quantum_teleportation(self):
        """Implement quantum teleportation protocol"""
        qc = QuantumCircuit(3, 2)
        
        # Create state to teleport (|1⟩)
        qc.x(0)
        
        # Create Bell pair
        qc.h(1)
        qc.cx(1, 2)
        
        # Teleport
        qc.cx(0, 1)
        qc.h(0)
        qc.measure([0, 1], [0, 1])
        
        # Apply corrections
        qc.cx(1, 2)
        qc.cz(0, 2)

        print('\nTeleportation Circuit:')
        print(qc)

        # Get statevector
        statevector_job = execute(qc, self.statevector_sim)
        statevector = statevector_job.result().get_statevector()

        print('\nFinal Statevector:')
        print(statevector)
        return qc, statevector

    def quantum_phase_kickback(self):
        """Demonstrate quantum phase kickback"""
        qc = QuantumCircuit(2, 2)
        
        # Prepare eigenstates
        qc.h(0)
        qc.h(1)
        
        # Controlled phase rotation
        qc.cp(np.pi/2, 0, 1)
        
        # Measure
        qc.measure([0,1], [0,1])

        print('\nPhase Kickback Circuit:')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

    def quantum_fourier_transform(self, n_qubits=3):
        """Implement Quantum Fourier Transform"""
        qc = QuantumCircuit(n_qubits)

        # Initialize some state
        qc.h(0)
        qc.x(1)

        print('\nInitial Circuit:')
        print(qc)

        # Apply QFT
        for i in range(n_qubits):
            qc.h(i)
            for j in range(i+1, n_qubits):
                qc.cp(2*np.pi/2**(j-i+1), i, j)

        print('\nAfter QFT Circuit:')
        print(qc)

        # Get statevector
        job = execute(qc, self.statevector_sim)
        statevector = job.result().get_statevector()

        print('\nFinal Statevector:')
        for i, amp in enumerate(statevector):
            if abs(amp) > 1e-10:
                print(f'|{i:0{n_qubits}b}⟩: {amp:.3f}')

        return qc, statevector

def main():
    qc = QuantumCircuitBasics()

    # 1. Create Bell State
    print('=== Bell State ===')
    qc.create_bell_state()

    # 2. Create GHZ State
    print('\n=== GHZ State ===')
    qc.create_ghz_state()

    # 3. Quantum Teleportation
    print('\n=== Quantum Teleportation ===')
    qc.quantum_teleportation()

    # 4. Phase Kickback
    print('\n=== Phase Kickback ===')
    qc.quantum_phase_kickback()

    # 5. Quantum Fourier Transform
    print('\n=== Quantum Fourier Transform ===')
    qc.quantum_fourier_transform(3)

if __name__ == '__main__':
    main()