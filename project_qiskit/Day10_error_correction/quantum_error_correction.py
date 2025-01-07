from qiskit import QuantumCircuit, Aer, execute
from qiskit.visualization import plot_histogram
from qiskit.providers.aer.noise import NoiseModel
import numpy as np

class QuantumErrorCorrection:
    def __init__(self):
        self.simulator = Aer.get_backend('qasm_simulator')
        self.statevector_sim = Aer.get_backend('statevector_simulator')

    def bit_flip_code(self, flip_index=None):
        """Implement three-qubit bit flip code"""
        qc = QuantumCircuit(3, 1)

        # Encode logical |1⟩
        qc.x(0)  # Create |1⟩ state to protect
        qc.barrier()

        # Encoding
        qc.cx(0, 1)  # CNOT from qubit 0 to 1
        qc.cx(0, 2)  # CNOT from qubit 0 to 2
        qc.barrier()

        # Error (if specified)
        if flip_index is not None:
            qc.x(flip_index)  # Bit flip on specified qubit
        qc.barrier()

        # Error correction
        qc.cx(0, 1)  # CNOT from qubit 0 to 1
        qc.cx(0, 2)  # CNOT from qubit 0 to 2
        qc.ccx(1, 2, 0)  # Toffoli gate
        qc.barrier()

        # Measure
        qc.measure(0, 0)

        print('Bit Flip Code Circuit:')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

    def phase_flip_code(self, phase_error=False):
        """Implement three-qubit phase flip code"""
        qc = QuantumCircuit(3, 1)

        # Create superposition
        qc.h(0)
        qc.barrier()

        # Encoding
        qc.h(1)
        qc.h(2)
        qc.cx(0, 1)
        qc.cx(0, 2)
        qc.barrier()

        # Error (if specified)
        if phase_error:
            qc.z(1)  # Phase flip on middle qubit
        qc.barrier()

        # Error correction
        qc.cx(0, 1)
        qc.cx(0, 2)
        qc.h(0)
        qc.h(1)
        qc.h(2)
        qc.barrier()

        # Measure
        qc.measure(0, 0)

        print('Phase Flip Code Circuit:')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

    def shor_code(self, error_type=None, error_index=None):
        """Implement nine-qubit Shor code"""
        qc = QuantumCircuit(9, 1)

        # Encode initial state |1⟩
        qc.x(0)
        qc.barrier()

        # First level encoding (phase flip code)
        qc.h(0)
        qc.cx(0, 3)
        qc.cx(0, 6)
        qc.h([0, 3, 6])

        # Second level encoding (bit flip code)
        for i in [0, 3, 6]:
            qc.cx(i, i+1)
            qc.cx(i, i+2)

        qc.barrier()

        # Apply error if specified
        if error_type and error_index is not None:
            if error_type == 'bit':
                qc.x(error_index)
            elif error_type == 'phase':
                qc.z(error_index)

        qc.barrier()

        # Error correction
        # Correct bit flips first
        for i in [0, 3, 6]:
            qc.cx(i, i+1)
            qc.cx(i, i+2)
            qc.ccx(i+1, i+2, i)

        # Then correct phase flips
        qc.h([0, 3, 6])
        qc.cx(0, 3)
        qc.cx(0, 6)
        qc.ccx(3, 6, 0)
        qc.h(0)

        # Measure
        qc.measure(0, 0)

        print('Shor Code Circuit:')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

    def steane_code(self):
        """Implement seven-qubit Steane code"""
        qc = QuantumCircuit(7, 1)

        # Encode logical |1⟩
        qc.x(0)
        qc.barrier()

        # Encoding circuit for Steane code
        qc.h([1, 2, 3])
        qc.cx(1, 4)
        qc.cx(2, 5)
        qc.cx(3, 6)
        qc.cx(0, 3)
        qc.cx(0, 2)
        qc.cx(0, 1)
        
        qc.barrier()

        # Syndrome measurement and correction would go here
        # This is a simplified version

        # Measure
        qc.measure(0, 0)

        print('Steane Code Circuit:')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return qc, counts

def main():
    qec = QuantumErrorCorrection()

    # Test bit flip code
    print('=== Bit Flip Code ===')
    qec.bit_flip_code()
    qec.bit_flip_code(1)  # With error on second qubit

    # Test phase flip code
    print('\n=== Phase Flip Code ===')
    qec.phase_flip_code()
    qec.phase_flip_code(True)  # With phase error

    # Test Shor code
    print('\n=== Shor Code ===')
    qec.shor_code()
    qec.shor_code('bit', 4)  # With bit flip error
    qec.shor_code('phase', 4)  # With phase flip error

    # Test Steane code
    print('\n=== Steane Code ===')
    qec.steane_code()

if __name__ == '__main__':
    main()