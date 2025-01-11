from qiskit import QuantumCircuit
from qiskit_aer import Aer  # Changed import
from qiskit.visualization import plot_histogram
from qiskit.compiler import transpile
import matplotlib.pyplot as plt

def deutsch_jozsa_algorithm(oracle_type='constant'):
    """
    Implement Deutsch-Jozsa algorithm to determine if function is constant or balanced
    """
    # Create quantum circuit with 2 qubits (1 query + 1 ancilla) and 1 classical bit
    qc = QuantumCircuit(2, 1)
    
    # Initialize ancilla qubit in |1⟩ state
    qc.x(1)
    
    # Apply Hadamard to both qubits
    qc.h([0,1])
    
    # Apply oracle
    if oracle_type == 'constant':
        # Do nothing for f(x) = 0
        pass
    else:  # balanced
        qc.cx(0, 1)  # f(x) = x
    
    # Apply Hadamard to query qubit
    qc.h(0)
    
    # Measure query qubit
    qc.measure(0, 0)
    
    # Execute circuit
    simulator = Aer.get_backend('qasm_simulator')
    qc_compiled = transpile(qc, simulator)
    job = simulator.run(qc_compiled, shots=1000)
    result = job.result()
    
    # Get and print results
    counts = result.get_counts(qc)
    print(f"\nDeutsch-Jozsa Algorithm Results ({oracle_type} oracle):")
    print("=" * 45)
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
    # Test with constant oracle
    deutsch_jozsa_algorithm('constant')
    
    # Test with balanced oracle
    deutsch_jozsa_algorithm('balanced')