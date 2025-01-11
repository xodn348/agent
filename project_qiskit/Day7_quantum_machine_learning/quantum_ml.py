from qiskit import QuantumCircuit
from qiskit_aer import Aer  # Changed import
from qiskit.visualization import plot_histogram
from qiskit.compiler import transpile
from qiskit.circuit import Parameter
import numpy as np
import matplotlib.pyplot as plt

def quantum_classifier(data_point, theta=np.pi/4):
    """
    Simple quantum classifier using a parameterized circuit
    data_point: 2D data point [x, y]
    theta: rotation parameter
    """
    # Create quantum circuit with 1 qubit
    qc = QuantumCircuit(1, 1)
    
    # Encode data point
    qc.rx(data_point[0], 0)  # Encode x
    qc.ry(data_point[1], 0)  # Encode y
    
    # Add parameterized rotation
    qc.rz(theta, 0)
    
    # Measure
    qc.measure(0, 0)
    
    # Execute circuit
    simulator = Aer.get_backend('qasm_simulator')
    qc_compiled = transpile(qc, simulator)
    job = simulator.run(qc_compiled, shots=1000)
    result = job.result()
    
    # Get results
    counts = result.get_counts(qc_compiled)
    
    # Calculate classification probability
    prob_class1 = counts.get('1', 0) / 1000
    
    return prob_class1, qc, counts

def demonstrate_classifier():
    # Generate some test points
    test_points = [
        [0.5, 0.5],   # Point 1
        [-0.5, -0.5], # Point 2
        [0.8, -0.2],  # Point 3
    ]
    
    print("\nQuantum Classifier Results:")
    print("=========================")
    
    for i, point in enumerate(test_points):
        prob, qc, counts = quantum_classifier(point)
        print(f"\nPoint {i+1} ({point}):")
        print(f"Classification probability: {prob:.3f}")
        print("Measurement counts:", counts)
        
        # Draw circuit
        print(f"\nCircuit for Point {i+1}:")
        print("=" * 20)
        print(qc)
        
        # Plot histogram
        plot_histogram(counts)
        plt.title(f"Results for Point {i+1}")
        plt.show()

if __name__ == "__main__":
    demonstrate_classifier()