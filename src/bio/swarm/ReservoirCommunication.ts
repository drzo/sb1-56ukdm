import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

interface ReservoirConfig {
  inputSize: number;
  reservoirSize: number;
  spectralRadius: number;
  inputScaling: number;
  leakingRate: number;
  sparsity: number;
}

export class ReservoirCommunication {
  private config: ReservoirConfig;
  private inputWeights: tf.Tensor2D;
  private reservoirWeights: tf.Tensor2D;
  private outputWeights: tf.Tensor2D | null = null;
  private state: tf.Tensor2D;
  private readoutLayer: tf.Sequential;

  constructor(config: Partial<ReservoirConfig> = {}) {
    this.config = {
      inputSize: config.inputSize || 64,
      reservoirSize: config.reservoirSize || 500,
      spectralRadius: config.spectralRadius || 0.95,
      inputScaling: config.inputScaling || 0.1,
      leakingRate: config.leakingRate || 0.3,
      sparsity: config.sparsity || 0.1
    };

    this.initializeWeights();
    this.initializeReadout();
    Logger.info('ReservoirCommunication initialized');
  }

  private initializeWeights(): void {
    // Initialize input weights
    this.inputWeights = tf.randomUniform(
      [this.config.reservoirSize, this.config.inputSize],
      -1,
      1
    ).mul(this.config.inputScaling);

    // Initialize reservoir weights with sparsity
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
    this.reservoirWeights = weights.div(maxEigenvalue).mul(this.config.spectralRadius);

    // Initialize state
    this.state = tf.zeros([1, this.config.reservoirSize]);
  }

  private initializeReadout(): void {
    this.readoutLayer = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          inputShape: [this.config.reservoirSize]
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: this.config.inputSize,
          activation: 'linear'
        })
      ]
    });

    this.readoutLayer.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });
  }

  async processSignal(input: Float32Array): Promise<Float32Array> {
    const timer = new Timer();
    try {
      // Convert input to tensor
      const inputTensor = tf.tensor2d([input], [1, this.config.inputSize]);

      // Update reservoir state
      const inputContribution = tf.matMul(inputTensor, this.inputWeights.transpose());
      const reservoirContribution = tf.matMul(this.state, this.reservoirWeights);

      // Apply leaking rate and nonlinearity
      this.state = this.state.mul(1 - this.config.leakingRate).add(
        tf.tanh(inputContribution.add(reservoirContribution)).mul(this.config.leakingRate)
      );

      // Generate output through readout layer
      const output = this.readoutLayer.predict(this.state) as tf.Tensor;
      const result = await output.data();

      // Cleanup
      inputTensor.dispose();
      output.dispose();

      Logger.debug(`Signal processed in ${timer.stop()}ms`);
      return new Float32Array(result);
    } catch (error) {
      Logger.error('Failed to process signal:', error);
      throw error;
    }
  }

  async train(
    inputs: Float32Array[],
    targets: Float32Array[],
    epochs: number = 100
  ): Promise<void> {
    const timer = new Timer();
    try {
      // Collect reservoir states
      const states: tf.Tensor2D[] = [];
      for (const input of inputs) {
        await this.processSignal(input);
        states.push(this.state.clone());
      }

      // Prepare training data
      const stateMatrix = tf.concat(states, 0);
      const targetMatrix = tf.tensor2d(
        targets.map(t => Array.from(t)),
        [targets.length, this.config.inputSize]
      );

      // Train readout layer
      await this.readoutLayer.fit(stateMatrix, targetMatrix, {
        epochs,
        batchSize: 32,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            Logger.debug(`Epoch ${epoch}: loss = ${logs?.loss}`);
          }
        }
      });

      // Cleanup
      stateMatrix.dispose();
      targetMatrix.dispose();

      Logger.info(`Training completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Training failed:', error);
      throw error;
    }
  }

  async save(path: string): Promise<void> {
    try {
      const saveData = {
        config: this.config,
        weights: {
          input: await this.inputWeights.array(),
          reservoir: await this.reservoirWeights.array(),
          state: await this.state.array()
        }
      };

      await this.readoutLayer.save(`localstorage://${path}-readout`);
      localStorage.setItem(path, JSON.stringify(saveData));
      Logger.info('Reservoir model saved');
    } catch (error) {
      Logger.error('Failed to save model:', error);
      throw error;
    }
  }

  async load(path: string): Promise<void> {
    try {
      const savedData = localStorage.getItem(path);
      if (!savedData) throw new Error('No saved model found');

      const { config, weights } = JSON.parse(savedData);
      this.config = config;

      this.inputWeights = tf.tensor2d(weights.input);
      this.reservoirWeights = tf.tensor2d(weights.reservoir);
      this.state = tf.tensor2d(weights.state);

      this.readoutLayer = await tf.loadLayersModel(`localstorage://${path}-readout`);
      Logger.info('Reservoir model loaded');
    } catch (error) {
      Logger.error('Failed to load model:', error);
      throw error;
    }
  }

  dispose(): void {
    this.inputWeights.dispose();
    this.reservoirWeights.dispose();
    this.state.dispose();
    // Readout layer disposed automatically by tf.js
  }
}