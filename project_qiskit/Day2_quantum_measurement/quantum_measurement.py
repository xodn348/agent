from qiskit import QuantumCircuit, Aer, execute, transpile, assemble
from qiskit.visualization import plot_histogram
from qiskit.tools.monitor import job_monitor
from qiskit.providers.aer.noise import NoiseModel
from qiskit.ignis.mitigation.measurement import CompleteMeasFitter
import numpy as np

class QuantumMeasurement:
    def __init__(self):
        self.simulator = Aer.get_backend('qasm_simulator')

    def single_qubit_measurement(self):
        """Demonstrate basic single qubit measurement"""
        # Create circuit
        qc = QuantumCircuit(1, 1)
        
        # Put in superposition
        qc.h(0)
        
        # Measure
        qc.measure(0, 0)
        
        print('Single Qubit Measurement Circuit:')
        print(qc)

        # Execute and get counts
        job = execute(qc, self.simulator, shots=1000)
        result = job.result()
        counts = result.get_counts(qc)

        print('\nMeasurement Results:')
        print(counts)
        return counts

    def measurement_basis_change(self):
        """Demonstrate measurement in different bases"""
        # X-basis measurement
        qc_x = QuantumCircuit(1, 1)
        qc_x.h(0)  # Create superposition
        qc_x.h(0)  # Change to X-basis
        qc_x.measure(0, 0)

        # Y-basis measurement
        qc_y = QuantumCircuit(1, 1)
        qc_y.h(0)  # Create superposition
        qc_y.sdg(0)  # Change to Y-basis
        qc_y.h(0)
        qc_y.measure(0, 0)

        print('\nMeasurement in Different Bases:')
        print('\nX-basis Circuit:')
        print(qc_x)
        print('\nY-basis Circuit:')
        print(qc_y)

        # Execute circuits
        results = {}
        for name, qc in [('X-basis', qc_x), ('Y-basis', qc_y)]:
            job = execute(qc, self.simulator, shots=1000)
            counts = job.result().get_counts(qc)
            results[name] = counts
            print(f'\n{name} Results:')
            print(counts)

        return results

    def error_mitigation_example(self):
        """Demonstrate basic error mitigation technique"""
        # Create a simple noise model
        noise_model = NoiseModel()
        error_prob = 0.1
        noise_model.add_all_qubit_quantum_error(error_prob, ['id', 'x'])

        # Create calibration circuits
        qr = QuantumCircuit(2, 2)
        cr = QuantumCircuit(2, 2)
        cr.x([0, 1])
        
        cal_circuits = [qr, cr]
        
        # Execute calibration circuits with noise
        job = execute(cal_circuits, 
                     self.simulator,
                     noise_model=noise_model,
                     shots=1000)
        cal_results = job.result()

        # Create the measurement fitter
        meas_fitter = CompleteMeasFitter(cal_results, state_labels=['00', '11'])

        # Create test circuit
        test_circuit = QuantumCircuit(2, 2)
        test_circuit.h([0, 1])
        test_circuit.cx(0, 1)
        test_circuit.measure([0, 1], [0, 1])

        # Execute test circuit with noise
        test_job = execute(test_circuit,
                          self.simulator,
                          noise_model=noise_model,
                          shots=1000)
        test_results = test_job.result()
        noisy_counts = test_results.get_counts(0)

        # Apply error mitigation
        mitigated_results = meas_fitter.filter.apply(test_results)
        mitigated_counts = mitigated_results.get_counts(0)

        print('\nError Mitigation Results:')
        print('Noisy measurements:', noisy_counts)
        print('Mitigated measurements:', mitigated_counts)

        return {'noisy': noisy_counts, 'mitigated': mitigated_counts}

    def demonstrate_projective_measurement(self):
        """Demonstrate projective measurements"""
        # Create circuit with entangled states
        qc = QuantumCircuit(2, 2)
        qc.h(0)
        qc.cx(0, 1)  # Create Bell state
        
        # First measure only one qubit
        qc.measure(0, 0)
        
        print('\nProjective Measurement Circuit:')
        print(qc)

        # Execute
        job = execute(qc, self.simulator, shots=1000)
        partial_counts = job.result().get_counts(qc)

        # Now measure both qubits
        qc.measure(1, 1)
        job = execute(qc, self.simulator, shots=1000)
        full_counts = job.result().get_counts(qc)

        print('\nPartial Measurement Results:')
        print(partial_counts)
        print('\nFull Measurement Results:')
        print(full_counts)

        return {'partial': partial_counts, 'full': full_counts}

def main():
    qm = QuantumMeasurement()

    # 1. Basic single qubit measurement
    print('=== Single Qubit Measurement ===')
    qm.single_qubit_measurement()

    # 2. Measurement in different bases
    print('\n=== Measurement in Different Bases ===')
    qm.measurement_basis_change()

    # 3. Error mitigation example
    print('\n=== Error Mitigation ===')
    qm.error_mitigation_example()

    # 4. Projective measurement demonstration
    print('\n=== Projective Measurement ===')
    qm.demonstrate_projective_measurement()

if __name__ == '__main__':
    main()