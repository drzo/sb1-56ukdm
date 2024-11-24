import { ESNConfig, ESNMetrics, TrainingData } from '../types/ESNTypes';
import { StateManager } from '../state/StateManager';
import { WeightManager } from '../weights/WeightManager';
import { BatchProcessor } from './BatchProcessor';
import { EarlyStopping } from './EarlyStopping';
import { CrossValidator } from './CrossValidator';
import { MetricsCalculator } from '../services/MetricsCalculator';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

export class TrainingManager {
  private config: ESNConfig;
  private batchProcessor: BatchProcessor;
  private earlyStopping: EarlyStopping;
  private crossValidator: CrossValidator;
  private metricsCalculator: MetricsCalculator;

  constructor(config: ESNConfig) {
    this.config = config;
    this.batchProcessor = new BatchProcessor();
    this.earlyStopping = new EarlyStopping();
    this.crossValidator = new CrossValidator();
    this.metricsCalculator = new MetricsCalculator();
  }

  async train(
    data: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager
  ): Promise<ESNMetrics> {
    const timer = new Timer();
    try {
      // Prepare cross-validation folds
      const folds = this.crossValidator.createFolds(data, 5);
      let bestMetrics: ESNMetrics | null = null;

      for (const { training, validation } of folds) {
        // Process in batches
        const batches = this.batchProcessor.createBatches(training);
        
        for (const batch of batches) {
          const metrics = await this.trainBatch(
            batch,
            stateManager,
            weightManager
          );
          
          // Validate and check early stopping
          const validationMetrics = await this.validate(
            validation,
            stateManager,
            weightManager
          );

          if (this.earlyStopping.shouldStop(validationMetrics)) {
            Logger.info('Early stopping triggered');
            break;
          }

          // Update best metrics
          if (!bestMetrics || validationMetrics.accuracy > bestMetrics.accuracy) {
            bestMetrics = validationMetrics;
          }
        }
      }

      Logger.info(`Training completed in ${timer.stop()}ms`);
      return bestMetrics!;
    } catch (error) {
      Logger.error('Training failed:', error);
      throw error;
    }
  }

  private async trainBatch(
    batch: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager
  ): Promise<ESNMetrics> {
    try {
      // Collect states
      const states = await this.collectStates(batch.inputs, stateManager);
      
      // Train output weights
      const outputWeights = await this.trainOutputWeights(
        states,
        tf.tensor2d(batch.targets)
      );
      
      weightManager.setOutputWeights(outputWeights);

      // Calculate training metrics
      return await this.metricsCalculator.calculateMetrics(
        states,
        batch.targets
      );
    } catch (error) {
      Logger.error('Batch training failed:', error);
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
      const lambda = 1e-6;
      const identity = tf.eye(stateMatrix.shape[1]).mul(lambda);
      const statesT = stateMatrix.transpose();
      
      return tf.matMul(
        tf.matMul(targets.transpose(), stateMatrix),
        tf.matMul(statesT, stateMatrix).add(identity).inverse()
      ).transpose();
    });
  }

  private async validate(
    data: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager
  ): Promise<ESNMetrics> {
    const states = await this.collectStates(data.inputs, stateManager);
    return this.metricsCalculator.calculateMetrics(states, data.targets);
  }

  dispose(): void {
    // Clean up any resources
  }
}