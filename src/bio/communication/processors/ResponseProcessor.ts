import { BaseProcessor } from './BaseProcessor';
import { SignalProcessingResult } from '../types';
import { Logger } from '../../../cogutil/Logger';
import * as tf from '@tensorflow/tfjs';

export class ResponseProcessor extends BaseProcessor {
  private decoder: tf.LayersModel | null = null;
  private readonly vocabSize: number;
  private readonly maxLength: number;

  constructor(vocabSize: number = 1000, maxLength: number = 50) {
    super('response-processor');
    this.vocabSize = vocabSize;
    this.maxLength = maxLength;
    this.initializeDecoder();
  }

  private async initializeDecoder(): Promise<void> {
    try {
      const model = tf.sequential();
      
      model.add(tf.layers.lstm({
        units: this.vocabSize,
        inputShape: [this.maxLength, this.vocabSize],
        returnSequences: true
      }));
      
      model.add(tf.layers.timeDistributed({
        layer: tf.layers.dense({
          units: this.vocabSize,
          activation: 'softmax'
        })
      }));

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy'
      });

      this.decoder = model;
      Logger.info('Response decoder initialized');
    } catch (error) {
      Logger.error('Failed to initialize decoder:', error);
      throw error;
    }
  }

  async process(input: Float32Array): Promise<SignalProcessingResult> {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input for response processing');
    }

    try {
      const inputReshaped = tf.tensor3d(
        [Array.from(input)],
        [1, this.maxLength, this.vocabSize]
      );
      
      const decoded = this.decoder!.predict(inputReshaped) as tf.Tensor;
      const result = await decoded.data();

      // Cleanup
      inputReshaped.dispose();
      decoded.dispose();

      return {
        processed: new Float32Array(result),
        metadata: {
          complexity: this.calculateResponseComplexity(result),
          confidence: this.calculateResponseConfidence(result),
          timestamp: Date.now()
        }
      };
    } catch (error) {
      Logger.error('Response processing failed:', error);
      throw error;
    }
  }

  private calculateResponseComplexity(response: Float32Array): number {
    // Calculate response complexity based on distribution entropy
    let entropy = 0;
    const total = response.reduce((a, b) => a + b, 0);
    
    response.forEach(prob => {
      if (prob > 0) {
        const p = prob / total;
        entropy -= p * Math.log2(p);
      }
    });

    return entropy / Math.log2(this.vocabSize);
  }

  private calculateResponseConfidence(response: Float32Array): number {
    // Calculate confidence based on probability distribution
    const maxProb = Math.max(...response);
    const entropy = this.calculateResponseComplexity(response);
    return maxProb * (1 - entropy); // High confidence = high max prob, low entropy
  }

  dispose(): void {
    this.decoder?.dispose();
    this.decoder = null;
  }
}