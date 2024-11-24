import { MinedPattern } from '../../../types';
import { MiningConfig } from '../core/mining-controller';
import { InterestingnessCalculator } from './interestingness';
import { SupportCalculator } from './support';
import { ComplexityCalculator } from './complexity';

export class MiningMetrics {
  private interestingness: InterestingnessCalculator;
  private support: SupportCalculator;
  private complexity: ComplexityCalculator;

  constructor(private config: MiningConfig) {
    this.interestingness = new InterestingnessCalculator();
    this.support = new SupportCalculator();
    this.complexity = new ComplexityCalculator();
  }

  isSignificant(pattern: MinedPattern, config: MiningConfig): boolean {
    return pattern.support >= config.minSupport &&
           pattern.confidence >= config.minConfidence &&
           this.isInteresting(pattern);
  }

  private isInteresting(pattern: MinedPattern): boolean {
    const complexityScore = this.complexity.calculatePatternComplexity(pattern.pattern);
    const normalizedInterestingness = pattern.interestingness / complexityScore;
    
    return normalizedInterestingness > 0.3;
  }

  calculateMetrics(pattern: MinedPattern): {
    support: number;
    confidence: number;
    interestingness: number;
    complexity: number;
  } {
    return {
      support: this.support.calculateSupport(pattern.instances),
      confidence: this.support.calculateConfidence(pattern.instances),
      interestingness: this.interestingness.calculate(
        pattern.pattern,
        pattern.instances
      ),
      complexity: this.complexity.calculatePatternComplexity(pattern.pattern)
    };
  }
}