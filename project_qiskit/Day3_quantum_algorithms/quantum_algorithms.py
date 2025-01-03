from qiskit import QuantumCircuit, Aer, execute
from qiskit.visualization import plot_histogram
import numpy as np

class QuantumAlgorithms:
    def __init__(self):
        self.simulator = Aer.get_backend('qasm_simulator')
        self.state_simulator = Aer.get_backend('statevector_simulator')

    def deutsch_jozsa_algorithm(self, oracle_type='constant'):
        """Implementation of Deutsch-Jozsa algorithm"""
        # Number of qubits (1 input qubit + 1 auxiliary qubit)
        n = 2
        
        # Create quantum circuit
        qc = QuantumCircuit(n, 1)
        
        # Initialize auxiliary qubit in |1⟩
        qc.x(1)
        
        # Apply Hadamard gates to create superposition
        qc.h([0, 1])
        
        # Apply oracle
        if oracle_type == 'constant':
            # Constant function oracle (f(x) = 0)
            pass
        else:
            # Balanced function oracle (f(x) = x)
            qc.cx(0, 1)
        
        # Apply Hadamard to input qubit
        qc.h(0)
        
        # Measure input qubit
        qc.measure(0, 0)
        
        print(f'\nDeutsch-Jozsa Circuit ({oracle_type} oracle):')
        print(qc)

        # Execute circuit
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return counts

    def grover_algorithm(self, marked_state='11'):
        """Implementation of Grover's search algorithm"""
        # Create circuit with 2 qubits
        qc = QuantumCircuit(2, 2)
        
        # Initialize superposition
        qc.h([0, 1])
        
        # Define number of iterations
        iterations = 1  # For 2 qubits, one iteration is optimal
        
        for _ in range(iterations):
            # Oracle
            if marked_state == '11':
                qc.cz(0, 1)  # Mark state |11⟩
            elif marked_state == '00':
                qc.x([0, 1])
                qc.cz(0, 1)
                qc.x([0, 1])
            
            # Diffusion operator
            qc.h([0, 1])
            qc.x([0, 1])
            qc.cz(0, 1)
            qc.x([0, 1])
            qc.h([0, 1])
        
        # Measure
        qc.measure([0, 1], [0, 1])
        
        print(f'\nGrover Circuit (marked state: {marked_state}):')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return counts

    def quantum_fourier_transform(self, n_qubits=3):
        """Implementation of Quantum Fourier Transform"""
        qc = QuantumCircuit(n_qubits)
        
        # Initialize some state (for example, computational basis state)
        qc.x(0)  # Initialize |100...0⟩
        
        # Apply QFT
        for i in range(n_qubits):
            qc.h(i)
            for j in range(i+1, n_qubits):
                qc.cp(2*np.pi/2**(j-i+1), i, j)
        
        # Swap qubits (optional but standard)
        for i in range(n_qubits//2):
            qc.swap(i, n_qubits-i-1)
        
        print('\nQFT Circuit:')
        print(qc)

        # Get statevector
        job = execute(qc, self.state_simulator)
        state = job.result().get_statevector()

        print('\nFinal state (first 8 amplitudes):')
        for i, amp in enumerate(state[:8]):
            print(f'|{i:0{n_qubits}b}⟩: {amp:.3f}')

        return state

    def phase_estimation(self, angle=np.pi/4):
        """Implementation of Quantum Phase Estimation"""
        # Use 3 counting qubits and 1 eigenvector qubit
        n_counting = 3
        qc = QuantumCircuit(n_counting + 1, n_counting)
        
        # Initialize eigenvector
        qc.x(n_counting)
        
        # Apply Hadamard gates to counting qubits
        for i in range(n_counting):
            qc.h(i)
        
        # Apply controlled rotations
        for i in range(n_counting):
            qc.cp(angle * 2**i, i, n_counting)
        
        # Apply inverse QFT to counting register
        for i in range(n_counting//2):
            qc.swap(i, n_counting-i-1)
        for i in range(n_counting-1, -1, -1):
            for j in range(i):
                qc.cp(-2*np.pi/2**(i-j+1), j, i)
            qc.h(i)
        
        # Measure counting register
        qc.measure(range(n_counting), range(n_counting))
        
        print('\nPhase Estimation Circuit:')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        
        # Convert measurements to phases
        phases = {}
        for outcome, count in counts.items():
            phase = int(outcome, 2)/(2**n_counting)
            phases[f"{phase:.3f}"] = count

        print('\nEstimated Phases:')
        print(phases)

        return counts, phases

def main():
    qa = QuantumAlgorithms()

    # 1. Deutsch-Jozsa Algorithm
    print('=== Deutsch-Jozsa Algorithm ===')
    qa.deutsch_jozsa_algorithm('constant')
    qa.deutsch_jozsa_algorithm('balanced')

    # 2. Grover's Algorithm
    print('\n=== Grover\'s Algorithm ===')
    qa.grover_algorithm('11')

    # 3. Quantum Fourier Transform
    print('\n=== Quantum Fourier Transform ===')
    qa.quantum_fourier_transform(3)

    # 4. Phase Estimation
    print('\n=== Phase Estimation ===')
    qa.phase_estimation(np.pi/4)

if __name__ == '__main__':
    main()