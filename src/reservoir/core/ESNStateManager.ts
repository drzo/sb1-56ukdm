import { ESNConfig, ESNState } from '../types/ESNTypes';
import { ESNStateStore } from '../state/ESNStateStore';
import { ESNStateMiddleware } from '../state/ESNStateMiddleware';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

export class ESNStateManager {
  private config: ESNConfig;
  private store: ESNStateStore;
  private middleware: ESNStateMiddleware;
  private weights: {
    input: tf.Tensor2D;
    reservoir: tf.Tensor2D;
    output: tf.Tensor2D | null;
  };
  private currentState: tf.Tensor2D;

  constructor(config: ESNConfig) {
    this.config = config;
    this.store = ESNStateStore.getInstance();
    this.middleware = new ESNStateMiddleware(config);
    
    // Initialize tensors with explicit shapes
    this.weights = {
      input: tf.zeros([config.reservoirSize, config.inputSize]),
      reservoir: tf.zeros([config.reservoirSize, config.reservoirSize]),
      output: null
    };
    this.currentState = tf.zeros([1, config.reservoirSize]);
  }

  async updateState(input: Float32Array | ESNState): Promise<Float32Array> {
    const timer = new Timer();
    try {
      if (input instanceof Float32Array) {
        // Process new input
        const inputTensor = tf.tensor2d([Array.from(input)], [1, input.length]);
        const newState = tf.tidy(() => {
          const inputContribution = tf.matMul(inputTensor, this.weights.input.transpose());
          const reservoirContribution = tf.matMul(this.currentState, this.weights.reservoir);
          
          const preActivation = inputContribution.add(reservoirContribution);
          const activation = this.applyActivation(preActivation);
          
          return activation.mul(this.config.leakingRate)
            .add(this.currentState.mul(1 - this.config.leakingRate));
        });

        // Update current state
        this.currentState.dispose();
        this.currentState = newState;

        // Get output
        const output = await this.currentState.array();
        Logger.debug(`State updated in ${timer.stop()}ms`);
        return new Float32Array(output[0]);
      } else {
        // Initialize from state object
        this.weights.input.dispose();
        this.weights.reservoir.dispose();
        this.currentState.dispose();

        this.weights = {
          input: tf.tensor2d(input.weights.input),
          reservoir: tf.tensor2d(input.weights.reservoir),
          output: input.weights.output.length > 0 ? 
            tf.tensor2d(input.weights.output) : null
        };
        this.currentState = tf.tensor2d([input.state]);

        return new Float32Array(input.state);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Logger.error('ESN state update failed:', message);
      throw new Error(`ESN state update failed: ${message}`);
    }
  }

  private applyActivation(tensor: tf.Tensor): tf.Tensor {
    switch (this.config.activationFunction) {
      case 'sigmoid':
        return tf.sigmoid(tensor);
      case 'relu':
        return tf.relu(tensor);
      case 'tanh':
      default:
        return tf.tanh(tensor);
    }
  }

  getCurrentState(): ESNState {
    return {
      weights: {
        input: this.weights.input.arraySync(),
        reservoir: this.weights.reservoir.arraySync(),
        output: this.weights.output?.arraySync() || []
      },
      state: this.currentState.arraySync()[0],
      history: [],
      timestamp: Date.now()
    };
  }

  dispose(): void {
    tf.dispose([
      this.weights.input,
      this.weights.reservoir,
      this.weights.output,
      this.currentState
    ]);
  }
}