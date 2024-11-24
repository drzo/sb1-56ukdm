export interface ESNConfig {
  // Basic parameters
  inputSize: number;
  reservoirSize: number;
  spectralRadius: number;
  inputScaling: number;
  leakingRate: number;
  sparsity: number;

  // Advanced parameters
  ridgeParam?: number;  // Ridge regression regularization
  activationFunction?: 'tanh' | 'sigmoid' | 'relu';
  bias?: number;  // Input bias term
  randomSeed?: number;  // For reproducibility
  inputBias?: boolean;  // Whether to add bias to input
  
  // ReservoirPy specific parameters
  feedback?: boolean;  // Enable feedback connections
  fbScaling?: number; // Feedback scaling factor
  regressionMethod?: 'ridge' | 'pinv' | 'lasso';
  solverArgs?: {
    alpha?: number;  // Ridge regression parameter
    max_iter?: number; // Max solver iterations
    tol?: number;    // Solver tolerance
  };
  washoutLength?: number;  // Initial transient to discard
  readoutRegularization?: number;  // Output layer regularization
}

export interface ESNState {
  weights: {
    input: number[][];
    reservoir: number[][];
    output: number[][];
    feedback?: number[][];  // Optional feedback connections
  };
  state: number[];
  history: number[][];
  bias?: number[];  // Bias terms
  timestamp: number;
}

export interface TrainingData {
  inputs: number[][];
  targets: number[][];
  validationSplit?: number;
  batchSize?: number;
  washoutLength?: number;  // Initial transient to discard
}

export interface ESNMetrics {
  accuracy: number;
  complexity: number;
  stability: number;
  memoryCapacity?: number;  // Added memory capacity metric
  kernelQuality?: number;  // Added kernel quality metric
  timestamp: number;
}