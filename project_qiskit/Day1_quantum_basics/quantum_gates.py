from qiskit import QuantumCircuit
from qiskit_aer import Aer
from qiskit.visualization import plot_histogram
from qiskit.compiler import transpile
import matplotlib.pyplot as plt

def demonstrate_quantum_gates():
    # Create a quantum circuit with 2 qubits and 2 classical bits
    qc = QuantumCircuit(2, 2)   # Both qubits start in |0⟩ state

    # Apply basic gates
    qc.h(0)    # Hadamard gate on qubit 0
    qc.x(1)    # NOT gate (X gate) on qubit 1
    qc.cx(0,1) # CNOT gate with control qubit 0 and target qubit 1
    
    # Measure qubits
    qc.measure([0,1], [0,1])

    # Execute the circuit on a simulator
    simulator = Aer.get_backend('qasm_simulator')
    # Transpile for the backend
    qc_compiled = transpile(qc, simulator)
    # Run and get results
    job = simulator.run(qc_compiled, shots=1000)
    result = job.result()

    # Get the counts of measurement outcomes
    counts = result.get_counts(qc)
    print("\nCircuit Results:")
    print("===============")
    for state, count in counts.items():
        print(f"State |{state}>: {count} shots")

    # Draw the circuit
    print("\nQuantum Circuit:")
    print("===============")
    print(qc)

    # Plot the histogram
    fig = plot_histogram(counts)
    plt.show()

if __name__ == "__main__":
    demonstrate_quantum_gates()