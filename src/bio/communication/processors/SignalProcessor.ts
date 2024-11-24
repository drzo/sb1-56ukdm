import { BaseProcessor } from './BaseProcessor';
import { SignalProcessingResult } from '../types';
import { Logger } from '../../../cogutil/Logger';
import * as tf from '@tensorflow/tfjs';

export class SignalProcessor extends BaseProcessor {
  private model: tf.LayersModel | null = null;
  private readonly inputSize: number;

  constructor(inputSize: number = 64) {
    super('signal-processor');
    this.inputSize = inputSize;
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    try {
      const model = tf.sequential();
      
      model.add(tf.layers.dense({
        units: this.inputSize * 2,
        activation: 'relu',
        inputShape: [this.inputSize]
      }));
      
      model.add(tf.layers.dense({
        units: this.inputSize,
        activation: 'linear'
      }));

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError'
      });

      this.model = model;
      Logger.info('Signal processing model initialized');
    } catch (error) {
      Logger.error('Failed to initialize signal processing model:', error);
      throw error;
    }
  }

  async process(input: Float32Array): Promise<SignalProcessingResult> {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input signal');
    }

    try {
      const inputTensor = tf.tensor2d([Array.from(input)], [1, this.inputSize]);
      const processed = this.model!.predict(inputTensor) as tf.Tensor;
      const result = await processed.data();

      // Cleanup
      inputTensor.dispose();
      processed.dispose();

      return {
        processed: new Float32Array(result),
        metadata: {
          complexity: this.calculateComplexity(input),
          confidence: this.calculateConfidence(input),
          timestamp: Date.now()
        }
      };
    } catch (error) {
      Logger.error('Signal processing failed:', error);
      throw error;
    }
  }

  private calculateComplexity(signal: Float32Array): number {
    // Calculate signal complexity using entropy
    let entropy = 0;
    const values = Array.from(signal);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 10;
    const histogram = new Array(bins).fill(0);

    values.forEach(value => {
      const bin = Math.floor((value - min) / (max - min) * (bins - 1));
      histogram[bin]++;
    });

    histogram.forEach(count => {
      const p = count / values.length;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    });

    return entropy / Math.log2(bins); // Normalize to [0,1]
  }

  private calculateConfidence(signal: Float32Array): number {
    // Calculate confidence based on signal properties
    const mean = signal.reduce((a, b) => a + b) / signal.length;
    const variance = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length;
    const snr = Math.abs(mean) / Math.sqrt(variance);
    return 1 / (1 + Math.exp(-snr)); // Sigmoid to bound in [0,1]
  }

  async train(inputs: Float32Array[], targets: Float32Array[]): Promise<void> {
    try {
      const inputTensor = tf.tensor2d(inputs.map(arr => Array.from(arr)));
      const targetTensor = tf.tensor2d(targets.map(arr => Array.from(arr)));

      await this.model!.fit(inputTensor, targetTensor, {
        epochs: 100,
        batchSize: 32,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            Logger.debug(`Training epoch ${epoch}: loss = ${logs?.loss}`);
          }
        }
      });

      inputTensor.dispose();
      targetTensor.dispose();
      Logger.info('Signal processor training completed');
    } catch (error) {
      Logger.error('Signal processor training failed:', error);
      throw error;
    }
  }

  dispose(): void {
    this.model?.dispose();
    this.model = null;
  }
}