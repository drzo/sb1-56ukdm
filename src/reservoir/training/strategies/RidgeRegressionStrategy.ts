import { TrainingStrategy } from './TrainingStrategy';
import { ESNConfig, ESNMetrics, TrainingData } from '../../types/ESNTypes';
import { StateManager } from '../../state/StateManager';
import { WeightManager } from '../../weights/WeightManager';
import { Logger } from '../../../cogutil/Logger';
import * as tf from '@tensorflow/tfjs';

export class RidgeRegressionStrategy implements TrainingStrategy {
  private ridgeParam: number;

  constructor(ridgeParam: number = 1e-6) {
    this.ridgeParam = ridgeParam;
  }

  async train(
    data: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager,
    config: ESNConfig
  ): Promise<ESNMetrics> {
    try {
      // Collect states
      const states = await this.collectStates(data.inputs, stateManager);
      
      // Train output weights
      const outputWeights = await this.trainOutputWeights(
        states,
        tf.tensor2d(data.targets)
      );
      
      weightManager.setOutputWeights(outputWeights);

      // Calculate training metrics
      return this.calculateMetrics(states, data.targets);
    } catch (error) {
      Logger.error('Ridge regression training failed:', error);
      throw error;
    }
  }

  async validate(
    data: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager
  ): Promise<ESNMetrics> {
    try {
      const states = await this.collectStates(data.inputs, stateManager);
      return this.calculateMetrics(states, data.targets);
    } catch (error) {
      Logger.error('Validation failed:', error);
      throw error;
    }
  }

  private async collectStates(
    inputs: number[][],
    stateManager: StateManager
  ): Promise<tf.Tensor2D[]> {
    const states: tf.Tensor2D[] = [];
    
    for (const input of inputs) {
      await stateManager.updateState(new Float32Array(input));
      states.push(tf.tensor2d([Array.from(stateManager.getCurrentState())]));
    }

    return states;
  }

  private async trainOutputWeights(
    states: tf.Tensor2D[],
    targets: tf.Tensor2D
  ): Promise<tf.Tensor2D> {
    return tf.tidy(() => {
      const stateMatrix = tf.concat(states, 0);
      const identity = tf.eye(stateMatrix.shape[1]).mul(this.ridgeParam);
      const statesT = stateMatrix.transpose();
      
      return tf.matMul(
        tf.matMul(targets.transpose(), stateMatrix),
        tf.matMul(statesT, stateMatrix).add(identity).inverse()
      ).transpose();
    });
  }

  private async calculateMetrics(
    states: tf.Tensor2D[],
    targets: number[][]
  ): Promise<ESNMetrics> {
    const predictions = await Promise.all(
      states.map(async state => {
        const output = await state.array();
        return output[0];
      })
    );

    const accuracy = this.calculateAccuracy(predictions, targets);
    const stability = this.calculateStability(predictions);
    const complexity = this.calculateComplexity(predictions);

    return {
      accuracy,
      stability,
      complexity,
      timestamp: Date.now()
    };
  }

  private calculateAccuracy(predictions: number[][], targets: number[][]): number {
    const mse = predictions.reduce((sum, pred, i) => {
      const target = targets[i];
      return sum + pred.reduce((s, p, j) => 
        s + Math.pow(p - target[j], 2), 0
      );
    }, 0) / (predictions.length * predictions[0].length);

    return 1 - Math.min(1, mse);
  }

  private calculateStability(predictions: number[][]): number {
    const variations = predictions.slice(1).map((pred, i) => {
      const prev = predictions[i];
      return pred.reduce((sum, val, j) => 
        sum + Math.pow(val - prev[j], 2), 0
      );
    });

    const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
    return Math.exp(-avgVariation);
  }

  private calculateComplexity(predictions: number[][]): number {
    return predictions.reduce((sum, pred) => 
      sum + Math.sqrt(pred.reduce((s, p) => s + p * p, 0)), 0
    ) / predictions.length;
  }
}