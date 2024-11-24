import { MinedPattern } from '../../../types';
import { MiningConfig } from './mining-controller';
import { PatternGenerator } from './pattern-generator';
import { PatternEvaluator } from './pattern-evaluator';
import { MiningStrategy } from './mining-strategy';
import { MiningValidator } from '../validation/mining-validator';
import { MiningMetrics } from '../metrics';

export class MiningOrchestrator {
  private strategy: MiningStrategy;
  private validator: MiningValidator;
  private metrics: MiningMetrics;

  constructor(
    private generator: PatternGenerator,
    private evaluator: PatternEvaluator,
    private config: MiningConfig
  ) {
    this.strategy = new MiningStrategy(generator, evaluator, config);
    this.validator = new MiningValidator();
    this.metrics = new MiningMetrics(config);
  }

  async minePatterns(): Promise<MinedPattern[]> {
    // Validate configuration
    if (!this.validator.validateConfig(this.config)) {
      throw new Error('Invalid mining configuration');
    }

    // Execute mining strategy
    const patterns = await this.strategy.executeMiningPhases();

    // Validate and filter results
    return this.validateAndFilterPatterns(patterns);
  }

  private validateAndFilterPatterns(patterns: MinedPattern[]): MinedPattern[] {
    return patterns
      .filter(pattern => this.validator.validateMinedPattern(pattern, this.config))
      .sort((a, b) => {
        const metricsA = this.metrics.calculateMetrics(a);
        const metricsB = this.metrics.calculateMetrics(b);
        
        // Primary sort by interestingness
        const interestingnessDiff = metricsB.interestingness - metricsA.interestingness;
        if (Math.abs(interestingnessDiff) > 0.001) return interestingnessDiff;
        
        // Secondary sort by support
        const supportDiff = b.support - a.support;
        if (Math.abs(supportDiff) > 0.001) return supportDiff;
        
        // Tertiary sort by confidence
        return b.confidence - a.confidence;
      })
      .slice(0, this.config.maxPatterns);
  }
}