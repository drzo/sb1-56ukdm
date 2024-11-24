import { ESNConfig, ESNState } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

/**
 * @deprecated Use ESNCore instead. This class is kept for backwards compatibility.
 */
export class ESNLegacyCore {
  private readonly config: ESNConfig;
  private weights: {
    input: tf.Tensor2D;
    reservoir: tf.Tensor2D;
    output: tf.Tensor2D | null;
  };
  private state: tf.Tensor2D;
  private initialized: boolean = false;

  constructor(config: ESNConfig) {
    this.config = config;
    this.weights = {
      input: tf.zeros([config.reservoirSize, config.inputSize]),
      reservoir: tf.zeros([config.reservoirSize, config.reservoirSize]),
      output: null
    };
    this.state = tf.zeros([1, config.reservoirSize]);
  }

  async initialize(): Promise<void> {
    const timer = new Timer();
    try {
      await tf.ready();

      // Initialize input weights
      this.weights.input = tf.randomUniform(
        [this.config.reservoirSize, this.config.inputSize],
        -1,
        1
      ).mul(this.config.inputScaling);

      // Initialize reservoir weights
      const weights = tf.randomUniform(
        [this.config.reservoirSize, this.config.reservoirSize],
        -1,
        1
      ).mul(tf.randomUniform(
        [this.config.reservoirSize, this.config.reservoirSize],
        0,
        1
      ).greater(1 - this.config.sparsity));

      // Scale to desired spectral radius
      const eigenvalues = tf.eye(this.config.reservoirSize); // Placeholder
      const maxEigenvalue = tf.max(tf.abs(eigenvalues));
      this.weights.reservoir = weights.div(maxEigenvalue).mul(this.config.spectralRadius);

      this.initialized = true;
      Logger.info(`Legacy ESN initialized in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to initialize legacy ESN:', error);
      throw error;
    }
  }

  async update(input: Float32Array): Promise<Float32Array> {
    if (!this.initialized) {
      throw new Error('ESN not initialized');
    }

    const timer = new Timer();
    try {
      const inputTensor = tf.tensor2d([Array.from(input)], [1, input.length]);
      
      const newState = tf.tidy(() => {
        const inputContribution = tf.matMul(inputTensor, this.weights.input.transpose());
        const reservoirContribution = tf.matMul(this.state, this.weights.reservoir);
        
        const preActivation = inputContribution.add(reservoirContribution);
        const activation = tf.tanh(preActivation);
        
        return activation.mul(this.config.leakingRate)
          .add(this.state.mul(1 - this.config.leakingRate));
      });

      // Update state
      this.state.dispose();
      this.state = newState;

      // Get output
      const output = await this.state.array();
      Logger.debug(`Legacy ESN updated in ${timer.stop()}ms`);
      return new Float32Array(output[0]);
    } catch (error) {
      Logger.error('Legacy ESN update failed:', error);
      throw error;
    }
  }

  getState(): ESNState {
    if (!this.initialized) {
      throw new Error('ESN not initialized');
    }

    return {
      weights: {
        input: this.weights.input.arraySync(),
        reservoir: this.weights.reservoir.arraySync(),
        output: this.weights.output?.arraySync() || []
      },
      state: this.state.arraySync()[0],
      history: [],
      timestamp: Date.now()
    };
  }

  dispose(): void {
    try {
      Object.values(this.weights).forEach(tensor => tensor?.dispose());
      this.state.dispose();
      this.initialized = false;
      Logger.info('Legacy ESN disposed');
    } catch (error) {
      Logger.error('Failed to dispose legacy ESN:', error);
      throw error;
    }
  }
}