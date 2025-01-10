from qiskit import QuantumCircuit, Aer, execute
from qiskit.circuit import Parameter
from qiskit.circuit.library import ZZFeatureMap, RealAmplitudes
from qiskit.quantum_info import Statevector
from qiskit_machine_learning.neural_networks import CircuitQNN
from qiskit_machine_learning.algorithms import VQC
from qiskit.utils import QuantumInstance
import numpy as np
from sklearn.datasets import make_blobs, make_moons
from sklearn.preprocessing import StandardScaler

class QuantumML:
    def __init__(self):
        self.simulator = Aer.get_backend('aer_simulator')
        self.quantum_instance = QuantumInstance(self.simulator)

    def create_qnn_classifier(self, n_qubits=2):
        """Create a quantum neural network classifier"""
        # Feature map
        feature_map = ZZFeatureMap(n_qubits)
        
        # Variational form
        ansatz = RealAmplitudes(n_qubits, reps=3)
        
        # Create classifier
        classifier = VQC(
            feature_map=feature_map,
            ansatz=ansatz,
            optimizer='COBYLA',
            quantum_instance=self.quantum_instance
        )
        
        return classifier

    def prepare_data(self, dataset='blobs', n_samples=100):
        """Prepare dataset for quantum ML"""
        if dataset == 'blobs':
            X, y = make_blobs(n_samples=n_samples, centers=2, n_features=2, random_state=42)
        elif dataset == 'moons':
            X, y = make_moons(n_samples=n_samples, noise=0.3, random_state=42)
        else:
            raise ValueError("Unknown dataset")

        # Scale features
        scaler = StandardScaler()
        X = scaler.fit_transform(X)
        
        return X, y

    def encode_data(self, X):
        """Encode classical data into quantum states"""
        n_samples, n_features = X.shape
        qc = QuantumCircuit(n_features)
        
        for i in range(n_features):
            qc.rx(X[0, i], i)
            qc.rz(X[0, i], i)
        
        # Add entanglement
        for i in range(n_features-1):
            qc.cx(i, i+1)
            
        return qc

    def create_variational_circuit(self, n_qubits):
        """Create variational quantum circuit"""
        qc = QuantumCircuit(n_qubits)
        params = [Parameter(f'θ_{i}') for i in range(n_qubits * 3)]
        
        # First rotation layer
        for i in range(n_qubits):
            qc.rx(params[i], i)
        
        # Entangling layer
        for i in range(n_qubits-1):
            qc.cx(i, i+1)
        
        # Second rotation layer
        for i in range(n_qubits):
            qc.ry(params[n_qubits + i], i)
            
        # Second entangling layer
        for i in range(n_qubits-1):
            qc.cx(i, i+1)
            
        # Final rotation layer
        for i in range(n_qubits):
            qc.rz(params[2*n_qubits + i], i)
            
        return qc

    def train_model(self, X_train, y_train):
        """Train quantum ML model"""
        n_features = X_train.shape[1]
        classifier = self.create_qnn_classifier(n_features)
        
        # Train model
        classifier.fit(X_train, y_train)
        
        return classifier

    def predict(self, model, X_test):
        """Make predictions using trained model"""
        return model.predict(X_test)

    def quantum_kernel(self, x1, x2):
        """Compute quantum kernel between two data points"""
        n_features = len(x1)
        qc = QuantumCircuit(n_features)
        
        # Encode first data point
        for i in range(n_features):
            qc.rx(x1[i], i)
            
        # Apply inverse encoding of second data point
        for i in range(n_features):
            qc.rx(-x2[i], i)
            
        # Add measurement
        qc.measure_all()
        
        # Execute circuit
        counts = execute(qc, self.simulator, shots=1000).result().get_counts()
        
        # Compute kernel value
        return counts.get('0' * n_features, 0) / 1000

    def compute_kernel_matrix(self, X):
        """Compute quantum kernel matrix for dataset"""
        n_samples = len(X)
        kernel_matrix = np.zeros((n_samples, n_samples))
        
        for i in range(n_samples):
            for j in range(i, n_samples):
                kernel_matrix[i,j] = self.quantum_kernel(X[i], X[j])
                kernel_matrix[j,i] = kernel_matrix[i,j]
                
        return kernel_matrix

def main():
    qml = QuantumML()
    
    # Prepare data
    X, y = qml.prepare_data('blobs', n_samples=20)
    print("\nData shape:", X.shape)
    
    # Train model
    model = qml.train_model(X, y)
    predictions = qml.predict(model, X)
    accuracy = np.mean(predictions == y)
    print(f"\nAccuracy: {accuracy:.2f}")
    
    # Compute kernel matrix
    kernel_matrix = qml.compute_kernel_matrix(X[:5])
    print("\nKernel matrix (first 5x5):\n", kernel_matrix)

if __name__ == '__main__':
    main()