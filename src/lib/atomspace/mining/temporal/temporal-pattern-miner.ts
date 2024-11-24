import { Atom, Pattern, MinedPattern } from '../../types';
import { MiningConfig } from '../core/mining-controller';
import { PatternEvaluator } from '../core/pattern-evaluator';
import { TemporalPatternGenerator } from './temporal-pattern-generator';
import { TemporalMetrics } from './temporal-metrics';

export class TemporalPatternMiner {
  private evaluator: PatternEvaluator;
  private generator: TemporalPatternGenerator;
  private metrics: TemporalMetrics;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: MiningConfig
  ) {
    this.evaluator = new PatternEvaluator(atomSpace);
    this.generator = new TemporalPatternGenerator();
    this.metrics = new TemporalMetrics(config);
  }

  async mineTemporalPatterns(): Promise<MinedPattern[]> {
    const patterns: MinedPattern[] = [];
    
    // Generate temporal patterns
    const temporalPatterns = this.generator.generatePatterns(
      Array.from(this.atomSpace.values())
    );

    // Evaluate each pattern
    for (const pattern of temporalPatterns) {
      const evaluated = this.evaluator.evaluatePattern(pattern);
      if (this.metrics.isSignificant(evaluated)) {
        patterns.push(evaluated);
      }
    }

    // Rank patterns by temporal significance
    return this.rankPatterns(patterns);
  }

  private rankPatterns(patterns: MinedPattern[]): MinedPattern[] {
    return patterns
      .sort((a, b) => {
        // Primary sort by temporal significance
        const temporalDiff = this.metrics.getTemporalSignificance(b) -
                           this.metrics.getTemporalSignificance(a);
        if (Math.abs(temporalDiff) > 0.001) return temporalDiff;

        // Secondary sort by support
        return b.support - a.support;
      })
      .slice(0, this.config.maxPatterns);
  }
}