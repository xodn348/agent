from qiskit import QuantumCircuit
from qiskit_aer import Aer  # Changed import
from qiskit.visualization import plot_histogram
from qiskit.compiler import transpile
import matplotlib.pyplot as plt
import numpy as np

def grover_algorithm(marked_state='11'):
    """
    Implement Grover's search algorithm
    """
    # Create quantum circuit with 2 qubits and 2 classical bits
    qc = QuantumCircuit(2, 2)
    
    # Initialize in superposition
    qc.h([0,1])
    
    # Grover iteration
    # Oracle: mark the target state
    if marked_state == '11':
        qc.cz(0, 1)  # Phase flip for |11⟩
    elif marked_state == '10':
        qc.x(1)
        qc.cz(0, 1)
        qc.x(1)
    elif marked_state == '01':
        qc.x(0)
        qc.cz(0, 1)
        qc.x(0)
    # else: marked_state == '00'
    
    # Diffusion operator
    qc.h([0,1])
    qc.x([0,1])
    qc.cz(0, 1)
    qc.x([0,1])
    qc.h([0,1])
    
    # Measure
    qc.measure([0,1], [0,1])
    
    # Execute circuit
    simulator = Aer.get_backend('qasm_simulator')
    qc_compiled = transpile(qc, simulator)
    job = simulator.run(qc_compiled, shots=1000)
    result = job.result()
    
    # Get and print results
    counts = result.get_counts(qc)
    print(f"\nGrover's Algorithm Results (marked state: |{marked_state}⟩):")
    print("=" * 50)
    for state, count in counts.items():
        print(f"State |{state}>: {count} shots")
        
    # Draw circuit
    print("\nCircuit:")
    print("========")
    print(qc)
    
    # Plot histogram
    plot_histogram(counts)
    plt.show()
    
    return qc, counts

if __name__ == "__main__":
    # Test Grover's algorithm with different marked states
    grover_algorithm('11')  # Search for |11⟩
    grover_algorithm('00')  # Search for |00⟩