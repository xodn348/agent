from qiskit import QuantumCircuit, Aer, execute
from qiskit.algorithms import QAOA
from qiskit.algorithms.optimizers import COBYLA
from qiskit.utils import QuantumInstance
from qiskit_optimization import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer
import networkx as nx
import numpy as np

class QuantumOptimizer:
    def __init__(self):
        self.simulator = Aer.get_backend('qasm_simulator')
        self.quantum_instance = QuantumInstance(self.simulator)

    def solve_maxcut(self, graph, p=1):
        """Solve MaxCut problem using QAOA"""
        # Create cost operator from graph
        adjacency_matrix = nx.adjacency_matrix(graph).toarray()
        size = len(adjacency_matrix)
        
        # Initialize quadratic program
        qp = QuadraticProgram()
        for i in range(size):
            qp.binary_var(name=f'x{i}')
        
        # Define objective function
        objective = 0
        for i in range(size):
            for j in range(i+1, size):
                if adjacency_matrix[i,j] != 0:
                    objective += adjacency_matrix[i,j] * qp.variables[i] * qp.variables[j]
        qp.maximize(objective)

        # Set up QAOA
        qaoa = QAOA(
            optimizer=COBYLA(maxiter=100),
            reps=p,
            quantum_instance=self.quantum_instance
        )

        # Solve MaxCut
        result = MinimumEigenOptimizer(qaoa).solve(qp)

        print('\nMaxCut QAOA Results:')
        print('Optimal value:', -result.fval)
        print('Cut:', result.x)

        return result

    def solve_tsp(self, distances, p=1):
        """Solve Traveling Salesman Problem using QAOA"""
        n_cities = len(distances)

        # Create QAOA circuit for TSP
        def create_tsp_circuit(params):
            qc = QuantumCircuit(n_cities**2)
            
            # Initial state preparation
            qc.h(range(n_cities**2))
            
            # Problem Hamiltonian
            gamma = params[0]
            for i in range(n_cities):
                for j in range(n_cities):
                    if i != j:
                        qc.rzz(gamma * distances[i][j],
                              i*n_cities + j,
                              ((i+1)%n_cities)*n_cities + j)
            
            # Mixing Hamiltonian
            beta = params[1]
            qc.rx(2*beta, range(n_cities**2))
            
            return qc

        # Define objective function
        def objective(params):
            qc = create_tsp_circuit(params)
            qc.measure_all()
            
            # Execute circuit
            counts = execute(qc, self.simulator, shots=1000).result().get_counts()
            
            # Evaluate solutions
            return min(self.evaluate_tsp_solution(bitstring, distances)
                      for bitstring in counts)

        # Optimize parameters
        optimizer = COBYLA(maxiter=100)
        result = optimizer.minimize(objective, [1.0, 1.0])

        # Get best solution
        best_params = result.x
        best_circuit = create_tsp_circuit(best_params)
        best_circuit.measure_all()
        counts = execute(best_circuit, self.simulator, shots=1000).result().get_counts()

        # Find best route
        best_bitstring = min(counts, key=lambda x: self.evaluate_tsp_solution(x, distances))
        best_route = self.decode_tsp_solution(best_bitstring, n_cities)

        print('\nTSP QAOA Results:')
        print('Best route:', best_route)
        print('Route length:', self.evaluate_tsp_solution(best_bitstring, distances))

        return best_route, counts

    def solve_vertex_cover(self, graph, p=1):
        """Solve Minimum Vertex Cover using QAOA"""
        size = len(graph)
        edges = list(graph.edges())
        
        # Create quadratic program
        qp = QuadraticProgram()
        
        # Add variables
        for i in range(size):
            qp.binary_var(name=f'x{i}')
        
        # Objective: minimize number of vertices
        objective = sum(qp.variables)
        qp.minimize(objective)
        
        # Constraints: each edge must be covered
        for i, j in edges:
            qp.linear_constraint(
                linear={f'x{i}': 1, f'x{j}': 1},
                sense='>=',
                rhs=1,
                name=f'edge_{i}_{j}'
            )

        # Solve using QAOA
        qaoa = QAOA(
            optimizer=COBYLA(maxiter=100),
            reps=p,
            quantum_instance=self.quantum_instance
        )

        result = MinimumEigenOptimizer(qaoa).solve(qp)

        print('\nVertex Cover QAOA Results:')
        print('Number of vertices:', result.fval)
        print('Selected vertices:', [i for i in range(size) if result.x[i] > 0.5])

        return result

    def evaluate_tsp_solution(self, bitstring, distances):
        """Evaluate TSP solution cost"""
        route = self.decode_tsp_solution(bitstring, len(distances))
        return sum(distances[route[i]][route[(i+1)%len(route)]]
                  for i in range(len(route)))

    def decode_tsp_solution(self, bitstring, n_cities):
        """Convert bitstring to TSP route"""
        matrix = np.array([int(b) for b in bitstring]).reshape(n_cities, n_cities)
        route = [-1] * n_cities
        
        # Find city positions
        for i in range(n_cities):
            city = np.where(matrix[:, i] == 1)[0]
            if len(city) == 1:
                route[i] = int(city[0])
        
        # Handle invalid solutions
        if -1 in route:
            return list(range(n_cities))  # Return simple route as fallback
            
        return route

def main():
    qopt = QuantumOptimizer()

    # Example: MaxCut
    print('=== MaxCut Problem ===')
    graph = nx.Graph()
    graph.add_edges_from([(0,1), (1,2), (2,3), (3,0)])
    qopt.solve_maxcut(graph)

    # Example: TSP
    print('\n=== Traveling Salesman Problem ===')
    distances = [
        [0, 10, 15, 20],
        [10, 0, 35, 25],
        [15, 35, 0, 30],
        [20, 25, 30, 0]
    ]
    qopt.solve_tsp(distances)

    # Example: Vertex Cover
    print('\n=== Vertex Cover Problem ===')
    graph = nx.Graph()
    graph.add_edges_from([(0,1), (1,2), (2,3)])
    qopt.solve_vertex_cover(graph)

if __name__ == '__main__':
    main()