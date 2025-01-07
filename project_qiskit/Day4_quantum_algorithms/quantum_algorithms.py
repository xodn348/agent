from qiskit import QuantumCircuit, Aer, execute
from qiskit.visualization import plot_histogram
import numpy as np

class QuantumAlgorithms:
    def __init__(self):
        self.simulator = Aer.get_backend('qasm_simulator')

    def deutsch_jozsa_algorithm(self, oracle_type='constant'):
        """Implementation of Deutsch-Jozsa algorithm"""
        qc = QuantumCircuit(2, 1)
        
        # Initialize
        qc.x(1)  # Put second qubit in |1⟩
        qc.h([0,1])  # Apply H-gates
        
        # Oracle
        if oracle_type == 'balanced':
            qc.cx(0, 1)  # Balanced function
        # For constant function, do nothing
        
        # Measurement basis
        qc.h(0)
        qc.measure(0, 0)

        # Execute circuit
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nDeutsch-Jozsa Results:')
        print(f'Oracle type: {oracle_type}')
        print('Measurement counts:', counts)
        return qc, counts

    def grover_algorithm(self, marked_element):
        """Implementation of Grover's search algorithm"""
        n = 3  # Number of qubits
        qc = QuantumCircuit(n, n)
        
        # Initialize superposition
        qc.h(range(n))
        
        # Number of iterations
        iterations = int(np.pi/4 * np.sqrt(2**n))
        
        for _ in range(iterations):
            # Oracle
            if isinstance(marked_element, str):
                # Apply X gates to bits that should be 0
                for qubit, bit in enumerate(reversed(marked_element)):
                    if bit == '0':
                        qc.x(qubit)
                # Multi-controlled Z gate
                qc.h(n-1)
                qc.mct(list(range(n-1)), n-1)
                qc.h(n-1)
                # Undo X gates
                for qubit, bit in enumerate(reversed(marked_element)):
                    if bit == '0':
                        qc.x(qubit)
            else:
                # Direct oracle for number input
                qc.mcrz(np.pi, list(range(n-1)), n-1)
            
            # Diffusion operator
            qc.h(range(n))
            qc.x(range(n))
            qc.h(n-1)
            qc.mct(list(range(n-1)), n-1)
            qc.h(n-1)
            qc.x(range(n))
            qc.h(range(n))
        
        # Measure
        qc.measure(range(n), range(n))

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nGrover Search Results:')
        print(f'Marked element: {marked_element}')
        print('Measurement counts:', counts)
        return qc, counts

    def qft_circuit(self, n_qubits):
        """Create Quantum Fourier Transform circuit"""
        circuit = QuantumCircuit(n_qubits)
        
        def swap_registers(circuit, n):
            for qubit in range(n//2):
                circuit.swap(qubit, n-qubit-1)
            return circuit
        
        def qft_rotations(circuit, n):
            if n == 0:
                return circuit
            n -= 1
            circuit.h(n)
            for qubit in range(n):
                circuit.cp(np.pi/2**(n-qubit), qubit, n)
            qft_rotations(circuit, n)
            
        qft_rotations(circuit, n_qubits)
        swap_registers(circuit, n_qubits)
        return circuit

    def quantum_phase_estimation(self, angle):
        """Implement Quantum Phase Estimation"""
        n_counting = 3  # Number of counting qubits
        qc = QuantumCircuit(n_counting + 1, n_counting)
        
        # Initialize eigenstate
        qc.x(n_counting)
        
        # Counting register in superposition
        for qubit in range(n_counting):
            qc.h(qubit)
        
        # Controlled rotations
        for i in range(n_counting):
            qc.cp(angle * 2**i, i, n_counting)
        
        # Inverse QFT on counting register
        qft_inv = self.qft_circuit(n_counting).inverse()
        qc.append(qft_inv, range(n_counting))
        
        # Measure counting register
        qc.measure(range(n_counting), range(n_counting))

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nPhase Estimation Results:')
        print(f'True angle: {angle/2/np.pi}')
        print('Measurement counts:', counts)
        return qc, counts

def main():
    qa = QuantumAlgorithms()

    # Test Deutsch-Jozsa
    print('=== Deutsch-Jozsa Algorithm ===')
    qa.deutsch_jozsa_algorithm('constant')
    qa.deutsch_jozsa_algorithm('balanced')

    # Test Grover's Search
    print('\n=== Grover Search ===')
    qa.grover_algorithm('101')

    # Test QFT
    print('\n=== Quantum Fourier Transform ===')
    qft_circuit = qa.qft_circuit(3)
    print(qft_circuit)

    # Test Phase Estimation
    print('\n=== Phase Estimation ===')
    qa.quantum_phase_estimation(np.pi/4)

if __name__ == '__main__':
    main()