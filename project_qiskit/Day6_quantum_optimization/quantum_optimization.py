from qiskit import QuantumCircuit
from qiskit_aer import Aer
from qiskit.visualization import plot_histogram
from qiskit.compiler import transpile
from qiskit.circuit import Parameter
import matplotlib.pyplot as plt
import numpy as np

def qaoa_maxcut(graph_edges, p=1):
    """
    Implement QAOA for MaxCut problem
    graph_edges: List of tuples representing edges [(0,1), (1,2), ...]
    p: Number of QAOA steps
    """
    # Get number of nodes
    n_nodes = max(max(edge) for edge in graph_edges) + 1
    
    # Create quantum circuit
    qc = QuantumCircuit(n_nodes, n_nodes)
    
    # Initialize in superposition
    qc.h(range(n_nodes))
    
    # QAOA parameters
    beta = Parameter('β')
    gamma = Parameter('γ')
    
    # Apply p layers of QAOA
    for _ in range(p):
        # Problem Hamiltonian
        for edge in graph_edges:
            i, j = edge
            qc.cx(i, j)
            qc.rz(gamma, j)
            qc.cx(i, j)
        
        # Mixing Hamiltonian
        for i in range(n_nodes):
            qc.rx(beta, i)
    
    # Measure all qubits
    qc.measure(range(n_nodes), range(n_nodes))
    
    # Execute circuit with specific parameters
    simulator = Aer.get_backend('qasm_simulator')
    beta_val = np.pi/4  # Example value
    gamma_val = np.pi/2  # Example value
    
    # Assign parameter values
    parameter_values = {
        beta: beta_val,
        gamma: gamma_val
    }
    bound_qc = qc.assign_parameters(parameter_values)
    
    # Compile and run
    qc_compiled = transpile(bound_qc, simulator)
    job = simulator.run(qc_compiled, shots=1000)
    result = job.result()
    
    # Get and print results
    counts = result.get_counts(qc_compiled)  # Changed from qc to qc_compiled
    print("\nQAOA MaxCut Results:")
    print("===================")
    for state, count in counts.items():
        cut_size = sum(1 for edge in graph_edges 
                      if state[edge[0]] != state[edge[1]])
        print(f"State |{state}>: {count} shots (Cut size: {cut_size})")
    
    # Draw circuit
    print("\nCircuit:")
    print("========")
    print(qc)
    
    # Plot histogram
    plot_histogram(counts)
    plt.show()
    
    return qc, counts

if __name__ == "__main__":
    # Example graph: Triangle
    edges = [(0,1), (1,2), (0,2)]
    qaoa_maxcut(edges)