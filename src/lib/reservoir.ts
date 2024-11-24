import { Matrix, multiply, add, random, transpose } from './matrix';

export class ReservoirComputer {
  private inputWeights: Matrix;
  private reservoirWeights: Matrix;
  private outputWeights: Matrix;
  private states: Matrix[];
  private size: number;
  private inputSize: number;
  private outputSize: number;
  private spectralRadius: number;
  private leakingRate: number;

  constructor(
    size: number,
    inputSize: number,
    outputSize: number,
    spectralRadius: number = 0.9,
    leakingRate: number = 0.3
  ) {
    this.size = size;
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.spectralRadius = spectralRadius;
    this.leakingRate = leakingRate;
    this.states = [];
    
    // Initialize weights
    this.inputWeights = random(size, inputSize, -1, 1);
    this.reservoirWeights = this.generateReservoirWeights();
    this.outputWeights = random(outputSize, size, -1, 1);
  }

  private generateReservoirWeights(): Matrix {
    const weights = random(this.size, this.size, -1, 1);
    const connectivity = 0.1; // 10% connectivity
    
    // Apply sparsity
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (Math.random() > connectivity) {
          weights[i][j] = 0;
        }
      }
    }

    // Scale to desired spectral radius
    const maxEigenvalue = this.calculateMaxEigenvalue(weights);
    const scalingFactor = this.spectralRadius / maxEigenvalue;
    
    return weights.map(row => row.map(val => val * scalingFactor));
  }

  private calculateMaxEigenvalue(matrix: Matrix): number {
    // Power iteration method for largest eigenvalue
    const maxIterations = 100;
    let vector = new Array(matrix.length).fill(1);
    
    for (let i = 0; i < maxIterations; i++) {
      const newVector = multiply([vector], matrix)[0];
      const norm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0));
      vector = newVector.map(val => val / norm);
    }
    
    const result = multiply([vector], matrix)[0];
    return Math.sqrt(result.reduce((sum, val) => sum + val * val, 0));
  }

  public update(input: number[]): number[] {
    const currentState = this.states[this.states.length - 1] || new Array(this.size).fill(0);
    const inputTerm = multiply([input], transpose(this.inputWeights))[0];
    const reservoirTerm = multiply([currentState], this.reservoirWeights)[0];
    
    // State update equation with leaking rate
    const newState = currentState.map((val, i) => 
      (1 - this.leakingRate) * val + 
      this.leakingRate * Math.tanh(inputTerm[i] + reservoirTerm[i])
    );
    
    this.states.push(newState);
    return multiply([newState], transpose(this.outputWeights))[0];
  }

  public train(inputs: Matrix, targets: Matrix, regularization: number = 1e-6): void {
    // Run inputs through reservoir
    this.states = [];
    inputs.forEach(input => this.update(input));
    
    // Collect states matrix
    const stateMatrix = this.states;
    
    // Ridge regression
    const statesT = transpose(stateMatrix);
    const term1 = multiply(transpose(targets), stateMatrix);
    const term2 = add(
      multiply(statesT, stateMatrix),
      multiply(
        [[regularization]], 
        [new Array(this.size).fill(1)]
      )[0]
    );
    
    this.outputWeights = multiply(term1, this.inverse(term2));
  }

  private inverse(matrix: Matrix): Matrix {
    // Simple matrix inversion for ridge regression
    // Note: In production, use a proper linear algebra library
    const n = matrix.length;
    const result = new Array(n).fill(0).map(() => new Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      result[i][i] = 1 / matrix[i][i];
    }
    
    return result;
  }

  public getStates(): Matrix {
    return this.states;
  }

  public getParameters(): {
    size: number;
    spectralRadius: number;
    leakingRate: number;
  } {
    return {
      size: this.size,
      spectralRadius: this.spectralRadius,
      leakingRate: this.leakingRate
    };
  }
}