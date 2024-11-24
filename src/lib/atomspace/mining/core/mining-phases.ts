import { MinedPattern, Pattern } from '../../../types';
import { MiningConfig } from './mining-controller';
import { PatternGenerator } from './pattern-generator';
import { PatternEvaluator } from './pattern-evaluator';
import { MiningMetrics } from '../metrics';

export abstract class MiningPhase {
  protected metrics: MiningMetrics;

  constructor(
    protected generator: PatternGenerator,
    protected evaluator: PatternEvaluator,
    protected config: MiningConfig
  ) {
    this.metrics = new MiningMetrics(config);
  }

  abstract execute(): Promise<MinedPattern[]>;

  protected async evaluatePatterns(patterns: Pattern[]): Promise<MinedPattern[]> {
    const evaluated = await Promise.all(
      patterns.map(p => this.evaluator.evaluatePattern(p))
    );
    
    return evaluated.filter(p => 
      this.metrics.isSignificant(p, this.config)
    );
  }
}

export class SinglePatternPhase extends MiningPhase {
  async execute(): Promise<MinedPattern[]> {
    const patterns = this.generator.generateSingleAtomPatterns();
    return this.evaluatePatterns(patterns);
  }
}

export class CompoundPatternPhase extends MiningPhase {
  constructor(
    generator: PatternGenerator,
    evaluator: PatternEvaluator,
    config: MiningConfig,
    private basePatterns: MinedPattern[]
  ) {
    super(generator, evaluator, config);
  }

  async execute(): Promise<MinedPattern[]> {
    const patterns = this.generator.generateCompoundPatterns(
      this.basePatterns.map(p => p.pattern)
    );
    return this.evaluatePatterns(patterns);
  }
}

export class RecursivePatternPhase extends MiningPhase {
  constructor(
    generator: PatternGenerator,
    evaluator: PatternEvaluator,
    config: MiningConfig,
    private basePatterns: MinedPattern[]
  ) {
    super(generator, evaluator, config);
  }

  async execute(): Promise<MinedPattern[]> {
    const significantPatterns = this.basePatterns.filter(p => 
      p.support > this.config.minSupport * 1.5
    );
    
    const patterns = significantPatterns.flatMap(p => 
      this.generator.generateRecursivePatterns(p.pattern, this.config.maxDepth)
    );
    
    return this.evaluatePatterns(patterns);
  }
}