import * as tf from '@tensorflow/tfjs';
import { Logger } from '../../cogutil/Logger';

export class ReservoirNetwork {
  private inputSize: number;
  private reservoirSize: number;
  private inputWeights: tf.Tensor2D;
  private reservoirWeights: tf.Tensor2D;
  private outputWeights: tf.Tensor2D | null = null;
  private state: tf.Tensor2D;
  private readonly spectralRadius = 0.95;
  private readonly sparsity = 0.1;
  private readonly leakingRate = 0.3;

  constructor(inputSize: number, reservoirSize: number) {
    this.inputSize = inputSize;
    this.reservoirSize = reservoirSize;
    
    // Initialize weights
    this.inputWeights = this.initializeInputWeights();
    this.reservoirWeights = this.initializeReservoirWeights();
    this.state = tf.zeros([1, this.reservoirSize]);
    
    Logger.info('ReservoirNetwork initialized');
  }

  private initializeInputWeights(): tf.Tensor2D {
    return tf.randomUniform([this.reservoirSize, this.inputSize], -1, 1);
  }

  private initializeReservoirWeights(): tf.Tensor2D {
    // Create sparse random matrix
    const weights = tf.randomUniform(
      [this.reservoirSize, this.reservoirSize],
      -1,
      1
    ).mul(tf.randomUniform(
      [this.reservoirSize, this.reservoirSize],
      0,
      1
    ).greater(1 - this.sparsity));

    // Scale to desired spectral radius
    const eigenvalues = tf.eye(this.reservoirSize); // Placeholder
    const maxEigenvalue = tf.max(tf.abs(eigenvalues));
    return weights.div(maxEigenvalue).mul(this.spectralRadius);
  }

  async process(
    input: Float32Array,
    history: Float32Array[] = []
  ): Promise<Float32Array> {
    try {
      // Convert input to tensor
      const inputTensor = tf.tensor2d([input], [1, this.inputSize]);
      
      // Update reservoir state
      const inputContribution = tf.matMul(inputTensor, this.inputWeights.transpose());
      const reservoirContribution = tf.matMul(this.state, this.reservoirWeights);
      
      // Apply leaking rate
      this.state = this.state.mul(1 - this.leakingRate).add(
        tf.tanh(inputContribution.add(reservoirContribution)).mul(this.leakingRate)
      );

      // Get state as array
      const stateArray = await this.state.array();
      return new Float32Array(stateArray[0]);
    } catch (error) {
      Logger.error('Failed to process input:', error);
      throw error;
    }
  }

  async generateOutput(state: tf.Tensor2D): Promise<tf.Tensor2D> {
    if (!this.outputWeights) {
      throw new Error('Output weights not trained');
    }

    try {
      return tf.matMul(state, this.outputWeights);
    } catch (error) {
      Logger.error('Failed to generate output:', error);
      throw error;
    }
  }

  async train(
    inputs: Float32Array[],
    outputs: Float32Array[]
  ): Promise<void> {
    try {
      // Collect states
      const states: tf.Tensor2D[] = [];
      for (const input of inputs) {
        const state = await this.process(input);
        states.push(tf.tensor2d([Array.from(state)], [1, this.reservoirSize]));
      }

      // Concatenate states
      const stateMatrix = tf.concat(states, 0);
      
      // Convert outputs to tensor
      const outputMatrix = tf.tensor2d(
        outputs.map(o => Array.from(o)),
        [outputs.length, outputs[0].length]
      );

      // Train output weights using ridge regression
      const lambda = 1e-6;
      const identity = tf.eye(this.reservoirSize).mul(lambda);
      const stateT = stateMatrix.transpose();
      
      this.outputWeights = tf.matMul(
        tf.matMul(outputMatrix.transpose(), stateMatrix),
        tf.matMul(stateT, stateMatrix).add(identity).inverse()
      ).transpose();

      Logger.info('Reservoir training completed');
    } catch (error) {
      Logger.error('Training failed:', error);
      throw error;
    }
  }

  async save(): Promise<void> {
    try {
      await tf.io.browserLocalStorage().save('reservoir', {
        'input_weights': this.inputWeights,
        'reservoir_weights': this.reservoirWeights,
        'output_weights': this.outputWeights,
        'state': this.state
      });
    } catch (error) {
      Logger.error('Failed to save reservoir:', error);
      throw error;
    }
  }

  async load(): Promise<void> {
    try {
      const loaded = await tf.io.browserLocalStorage().load('reservoir');
      this.inputWeights = loaded['input_weights'] as tf.Tensor2D;
      this.reservoirWeights = loaded['reservoir_weights'] as tf.Tensor2D;
      this.outputWeights = loaded['output_weights'] as tf.Tensor2D;
      this.state = loaded['state'] as tf.Tensor2D;
    } catch (error) {
      Logger.error('Failed to load reservoir:', error);
      throw error;
    }
  }

  dispose(): void {
    this.inputWeights.dispose();
    this.reservoirWeights.dispose();
    this.outputWeights?.dispose();
    this.state.dispose();
  }
}