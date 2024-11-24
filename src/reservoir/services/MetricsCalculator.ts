import { ESNCore } from '../core/ESNCore';
import { TrainingData, ESNMetrics } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export class MetricsCalculator {
  async calculateMetrics(
    esn: ESNCore,
    data: TrainingData
  ): Promise<ESNMetrics> {
    try {
      const predictions = await Promise.all(
        data.inputs.map(input => 
          esn.update(new Float32Array(input))
        )
      );

      return {
        accuracy: this.calculateAccuracy(predictions, data.targets),
        complexity: this.calculateComplexity(esn.getState()),
        stability: this.calculateStability(predictions),
        timestamp: Date.now()
      };
    } catch (error) {
      Logger.error('Failed to calculate metrics:', error);
      throw error;
    }
  }

  private calculateAccuracy(
    predictions: Float32Array[],
    targets: number[][]
  ): number {
    const mse = predictions.reduce((sum, pred, i) => {
      const target = targets[i];
      return sum + pred.reduce((s, p, j) => 
        s + Math.pow(p - target[j], 2), 0
      );
    }, 0) / (predictions.length * predictions[0].length);

    return 1 - Math.min(1, mse);
  }

  private calculateComplexity(state: any): number {
    return state.weights.reservoir.length * 
      state.weights.reservoir[0].length / 
      state.weights.input[0].length;
  }

  private calculateStability(predictions: Float32Array[]): number {
    const variations = predictions.slice(1).map((pred, i) => {
      const prev = predictions[i];
      return pred.reduce((sum, val, j) => 
        sum + Math.pow(val - prev[j], 2), 0
      );
    });

    const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
    return Math.exp(-avgVariation);
  }
}