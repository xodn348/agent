from qiskit import QuantumCircuit
from qiskit_aer import Aer
from qiskit.visualization import plot_histogram
import matplotlib.pyplot as plt
import numpy as np

def create_and_visualize_circuit():
    # Create a quantum circuit
    qc = QuantumCircuit(2, 2)
    
    # Create Bell state
    qc.h(0)
    qc.cx(0, 1)
    qc.measure([0,1], [0,1])
    
    # Draw the circuit
    print("Quantum Circuit:")
    print(qc)
    
    # Execute the circuit
    simulator = Aer.get_backend('qasm_simulator')
    job = simulator.run(qc, shots=1000)
    result = job.result()
    counts = result.get_counts(qc)
    
    # Plot the results
    plt.figure(figsize=(8, 6))
    plot_histogram(counts)
    plt.title("Bell State Measurement Results")
    plt.show()

if __name__ == "__main__":
    create_and_visualize_circuit()
    