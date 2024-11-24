import { TrainingStrategy } from './TrainingStrategy';
import { ESNConfig, ESNMetrics, TrainingData } from '../../types/ESNTypes';
import { StateManager } from '../../state/StateManager';
import { WeightManager } from '../../weights/WeightManager';
import { Logger } from '../../../cogutil/Logger';
import * as tf from '@tensorflow/tfjs';

export class ForceStrategy implements TrainingStrategy {
  private learningRate: number;
  private maxIterations: number;

  constructor(learningRate: number = 0.01, maxIterations: number = 1000) {
    this.learningRate = learningRate;
    this.maxIterations = maxIterations;
  }

  async train(
    data: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager,
    config: ESNConfig
  ): Promise<ESNMetrics> {
    try {
      let weights = tf.randomNormal([config.reservoirSize, data.targets[0].length]);
      
      for (let i = 0; i < this.maxIterations; i++) {
        const error = await this.calculateError(
          data,
          stateManager,
          weights
        );

        const errorValue = await error.data();
        if (errorValue[0] < 1e-6) break;

        weights = await this.updateWeights(
          weights,
          data,
          stateManager
        );
      }

      weightManager.setOutputWeights(weights);
      return this.calculateMetrics(data, stateManager, weights);
    } catch (error) {
      Logger.error('FORCE training failed:', error);
      throw error;
    }
  }

  async validate(
    data: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager
  ): Promise<ESNMetrics> {
    try {
      const weights = weightManager.getOutputWeights();
      if (!weights) throw new Error('No output weights available');
      return this.calculateMetrics(data, stateManager, weights);
    } catch (error) {
      Logger.error('Validation failed:', error);
      throw error;
    }
  }

  private async calculateError(
    data: TrainingData,
    stateManager: StateManager,
    weights: tf.Tensor2D
  ): Promise<tf.Tensor> {
    return tf.tidy(() => {
      const states = data.inputs.map(input => 
        tf.tensor2d([Array.from(stateManager.getCurrentState())])
      );
      
      const predictions = states.map(state => 
        tf.matMul(state, weights)
      );
      
      const errors = predictions.map((pred, j) =>
        tf.sub(pred, tf.tensor2d([data.targets[j]]))
      );

      return tf.mean(tf.stack(errors.map(e => tf.sum(tf.square(e)))));
    });
  }

  private async updateWeights(
    weights: tf.Tensor2D,
    data: TrainingData,
    stateManager: StateManager
  ): Promise<tf.Tensor2D> {
    return tf.tidy(() => {
      const gradients = tf.grad(w => {
        const states = data.inputs.map(input => 
          tf.tensor2d([Array.from(stateManager.getCurrentState())])
        );
        const preds = states.map(state => tf.matMul(state, w));
        return tf.mean(tf.stack(preds.map((pred, j) =>
          tf.sum(tf.square(tf.sub(pred, tf.tensor2d([data.targets[j]]))))
        )));
      })(weights);

      return weights.sub(gradients.mul(this.learningRate));
    });
  }

  private async calculateMetrics(
    data: TrainingData,
    stateManager: StateManager,
    weights: tf.Tensor2D
  ): Promise<ESNMetrics> {
    const predictions = await Promise.all(
      data.inputs.map(async input => {
        const state = tf.tensor2d([Array.from(stateManager.getCurrentState())]);
        const pred = tf.matMul(state, weights);
        return pred.array();
      })
    );

    const accuracy = this.calculateAccuracy(predictions, data.targets);
    const stability = this.calculateStability(predictions);
    const complexity = this.calculateComplexity(predictions);

    return {
      accuracy,
      stability,
      complexity,
      timestamp: Date.now()
    };
  }

  private calculateAccuracy(predictions: number[][][], targets: number[][]): number {
    const mse = predictions.reduce((sum, pred, i) => {
      const target = targets[i];
      return sum + pred[0].reduce((s, p, j) => 
        s + Math.pow(p - target[j], 2), 0
      );
    }, 0) / (predictions.length * predictions[0][0].length);

    return 1 - Math.min(1, mse);
  }

  private calculateStability(predictions: number[][][]): number {
    const variations = predictions.slice(1).map((pred, i) => {
      const prev = predictions[i];
      return pred[0].reduce((sum, val, j) => 
        sum + Math.pow(val - prev[0][j], 2), 0
      );
    });

    const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
    return Math.exp(-avgVariation);
  }

  private calculateComplexity(predictions: number[][][]): number {
    return predictions.reduce((sum, pred) => 
      sum + Math.sqrt(pred[0].reduce((s, p) => s + p * p, 0)), 0
    ) / predictions.length;
  }
}