import * as tf from '@tensorflow/tfjs';
import { Logger } from '../../cogutil/Logger';

interface ModelConfig {
  inputSize: number;
  hiddenSize: number;
  outputSize: number;
  learningRate: number;
  batchSize: number;
  validationSplit: number;
}

export class ModelOptimizer {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  createModel(): tf.LayersModel {
    try {
      const model = tf.sequential();

      // Input layer with batch normalization
      model.add(tf.layers.dense({
        units: this.config.hiddenSize,
        activation: 'relu',
        inputShape: [this.config.inputSize]
      }));
      model.add(tf.layers.batchNormalization());

      // Hidden layers with residual connections
      this.addResidualBlock(model);
      this.addResidualBlock(model);

      // Attention layer
      model.add(tf.layers.dense({
        units: this.config.hiddenSize,
        activation: 'tanh'
      }));
      model.add(tf.layers.dropout({ rate: 0.2 }));

      // Output layer
      model.add(tf.layers.dense({
        units: this.config.outputSize,
        activation: 'sigmoid'
      }));

      model.compile({
        optimizer: tf.train.adam(this.config.learningRate),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      return model;
    } catch (error) {
      Logger.error('Failed to create model:', error);
      throw error;
    }
  }

  private addResidualBlock(model: tf.Sequential): void {
    const input = model.layers[model.layers.length - 1].output as tf.SymbolicTensor;
    
    const branch = tf.layers.dense({
      units: this.config.hiddenSize,
      activation: 'relu'
    }).apply(input) as tf.SymbolicTensor;
    
    const dropout = tf.layers.dropout({
      rate: 0.1
    }).apply(branch) as tf.SymbolicTensor;
    
    const output = tf.layers.add().apply([input, dropout]) as tf.SymbolicTensor;
    
    model.add(tf.layers.activation({ activation: 'relu' }));
  }

  async trainModel(
    model: tf.LayersModel,
    inputs: tf.Tensor2D,
    targets: tf.Tensor2D,
    epochs: number
  ): Promise<tf.History> {
    try {
      return await model.fit(inputs, targets, {
        epochs,
        batchSize: this.config.batchSize,
        validationSplit: this.config.validationSplit,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            Logger.debug(
              `Training epoch ${epoch}: loss = ${logs?.loss}, ` +
              `accuracy = ${logs?.acc}`
            );
          }
        }
      });
    } catch (error) {
      Logger.error('Failed to train model:', error);
      throw error;
    }
  }
}