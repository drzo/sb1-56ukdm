import { MinedPattern } from '../../../types';
import { MiningPhase, SinglePatternPhase, CompoundPatternPhase, RecursivePatternPhase } from './mining-phases';
import { PatternGenerator } from './pattern-generator';
import { PatternEvaluator } from './pattern-evaluator';
import { MiningConfig } from './mining-controller';
import { MiningMetrics } from '../metrics';

export class MiningStrategy {
  private metrics: MiningMetrics;

  constructor(
    private generator: PatternGenerator,
    private evaluator: PatternEvaluator,
    private config: MiningConfig
  ) {
    this.metrics = new MiningMetrics(config);
  }

  async executeMiningPhases(): Promise<MinedPattern[]> {
    // Phase 1: Single Atom Patterns
    const singlePhase = new SinglePatternPhase(
      this.generator,
      this.evaluator,
      this.config
    );
    const singlePatterns = await singlePhase.execute();
    
    // Phase 2: Compound Patterns
    const compoundPhase = new CompoundPatternPhase(
      this.generator,
      this.evaluator,
      this.config,
      singlePatterns
    );
    const compoundPatterns = await compoundPhase.execute();
    
    // Phase 3: Recursive Patterns
    const recursivePhase = new RecursivePatternPhase(
      this.generator,
      this.evaluator,
      this.config,
      [...singlePatterns, ...compoundPatterns]
    );
    const recursivePatterns = await recursivePhase.execute();
    
    return this.rankPatterns([
      ...singlePatterns,
      ...compoundPatterns,
      ...recursivePatterns
    ]);
  }

  private rankPatterns(patterns: MinedPattern[]): MinedPattern[] {
    return patterns
      .sort((a, b) => {
        // Primary sort by interestingness
        if (a.interestingness !== b.interestingness) {
          return b.interestingness - a.interestingness;
        }
        // Secondary sort by support
        if (a.support !== b.support) {
          return b.support - a.support;
        }
        // Tertiary sort by confidence
        return b.confidence - a.confidence;
      })
      .slice(0, this.config.maxPatterns);
  }
}