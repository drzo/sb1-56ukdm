import { ESNConfig, ESNMetrics } from '../../types/ESNTypes';
import { Logger } from '../../../cogutil/Logger';

export class RandomSearchOptimizer {
  private readonly numTrials: number;
  private readonly parameterRanges: {
    spectralRadius: [number, number];
    inputScaling: [number, number];
    leakingRate: [number, number];
    sparsity: [number, number];
  };

  constructor(
    numTrials: number = 100,
    ranges?: Partial<typeof RandomSearchOptimizer.prototype.parameterRanges>
  ) {
    this.numTrials = numTrials;
    this.parameterRanges = {
      spectralRadius: [0.1, 1.0],
      inputScaling: [0.1, 2.0],
      leakingRate: [0.1, 0.9],
      sparsity: [0.1, 0.9],
      ...ranges
    };
  }

  async optimize(
    baseConfig: ESNConfig,
    evaluateConfig: (config: ESNConfig) => Promise<ESNMetrics>
  ): Promise<{ config: ESNConfig; metrics: ESNMetrics }> {
    try {
      let bestResult: { config: ESNConfig; metrics: ESNMetrics } | null = null;

      for (let i = 0; i < this.numTrials; i++) {
        const config = {
          ...baseConfig,
          ...this.generateRandomParameters()
        };

        const metrics = await evaluateConfig(config);
        const score = metrics.accuracy + metrics.stability;

        if (!bestResult || score > (bestResult.metrics.accuracy + bestResult.metrics.stability)) {
          bestResult = { config, metrics };
          Logger.debug(`New best configuration found: accuracy=${metrics.accuracy}, stability=${metrics.stability}`);
        }
      }

      return bestResult!;
    } catch (error) {
      Logger.error('Random search optimization failed:', error);
      throw error;
    }
  }

  private generateRandomParameters(): Partial<ESNConfig> {
    return {
      spectralRadius: this.randomFloat(...this.parameterRanges.spectralRadius),
      inputScaling: this.randomFloat(...this.parameterRanges.inputScaling),
      leakingRate: this.randomFloat(...this.parameterRanges.leakingRate),
      sparsity: this.randomFloat(...this.parameterRanges.sparsity)
    };
  }

  private randomFloat(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  setParameterRanges(ranges: Partial<typeof RandomSearchOptimizer.prototype.parameterRanges>): void {
    Object.assign(this.parameterRanges, ranges);
  }
}