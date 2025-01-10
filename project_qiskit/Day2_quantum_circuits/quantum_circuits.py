from qiskit import QuantumCircuit
from qiskit_aer import Aer  # Changed import
from qiskit.visualization import plot_histogram
from qiskit.compiler import transpile
import matplotlib.pyplot as plt

def create_bell_state():
    # Create a quantum circuit with 2 qubits and 2 classical bits
    qc = QuantumCircuit(2, 2)

    # Create Bell state
    qc.h(0)    # Put qubit 0 in superposition
    qc.cx(0,1) # Entangle qubits 0 and 1
    
    # Measure both qubits
    qc.measure([0,1], [0,1])

    # Execute the circuit
    simulator = Aer.get_backend('qasm_simulator')
    qc_compiled = transpile(qc, simulator)
    job = simulator.run(qc_compiled, shots=1000)
    result = job.result()

    # Get and print results
    counts = result.get_counts(qc)
    print("\nBell State Results:")
    print("==================")
    for state, count in counts.items():
        print(f"State |{state}>: {count} shots")

    # Draw circuit
    print("\nBell State Circuit:")
    print("==================")
    print(qc)

    # Plot histogram
    plot_histogram(counts)
    plt.show()

    return qc, counts

if __name__ == "__main__":
    create_bell_state()