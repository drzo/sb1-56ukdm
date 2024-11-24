import { ESNConfig, ESNMetrics } from '../../types/ESNTypes';
import { Logger } from '../../../cogutil/Logger';

export class GridSearchOptimizer {
  private readonly parameterRanges: {
    spectralRadius: number[];
    inputScaling: number[];
    leakingRate: number[];
    sparsity: number[];
  };

  constructor(ranges?: Partial<typeof GridSearchOptimizer.prototype.parameterRanges>) {
    this.parameterRanges = {
      spectralRadius: [0.1, 0.5, 0.9, 0.99],
      inputScaling: [0.1, 0.5, 1.0, 2.0],
      leakingRate: [0.1, 0.3, 0.5, 0.7, 0.9],
      sparsity: [0.1, 0.3, 0.5, 0.7, 0.9],
      ...ranges
    };
  }

  async optimize(
    baseConfig: ESNConfig,
    evaluateConfig: (config: ESNConfig) => Promise<ESNMetrics>
  ): Promise<{ config: ESNConfig; metrics: ESNMetrics }> {
    try {
      let bestResult: { config: ESNConfig; metrics: ESNMetrics } | null = null;

      // Generate all combinations
      const combinations = this.generateCombinations();
      Logger.info(`Starting grid search with ${combinations.length} combinations`);

      // Evaluate each combination
      for (const params of combinations) {
        const config = {
          ...baseConfig,
          ...params
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
      Logger.error('Grid search optimization failed:', error);
      throw error;
    }
  }

  private generateCombinations(): Array<Partial<ESNConfig>> {
    const combinations: Array<Partial<ESNConfig>> = [];

    for (const spectralRadius of this.parameterRanges.spectralRadius) {
      for (const inputScaling of this.parameterRanges.inputScaling) {
        for (const leakingRate of this.parameterRanges.leakingRate) {
          for (const sparsity of this.parameterRanges.sparsity) {
            combinations.push({
              spectralRadius,
              inputScaling,
              leakingRate,
              sparsity
            });
          }
        }
      }
    }

    return combinations;
  }

  setParameterRanges(ranges: Partial<typeof GridSearchOptimizer.prototype.parameterRanges>): void {
    Object.assign(this.parameterRanges, ranges);
  }
}