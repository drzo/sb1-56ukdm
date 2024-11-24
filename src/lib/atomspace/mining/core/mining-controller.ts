import { Atom, Pattern, MinedPattern } from '../../../types';
import { PatternGenerator } from './pattern-generator';
import { PatternEvaluator } from './pattern-evaluator';

export interface MiningConfig {
  minSupport: number;
  minConfidence: number;
  maxPatterns: number;
  maxDepth: number;
}

export class MiningController {
  private generator: PatternGenerator;
  private evaluator: PatternEvaluator;
  private config: MiningConfig;

  constructor(
    atomSpace: Map<string, Atom>,
    config: Partial<MiningConfig> = {}
  ) {
    this.generator = new PatternGenerator();
    this.evaluator = new PatternEvaluator(atomSpace);
    this.config = {
      minSupport: config.minSupport ?? 0.1,
      minConfidence: config.minConfidence ?? 0.5,
      maxPatterns: config.maxPatterns ?? 100,
      maxDepth: config.maxDepth ?? 2
    };
  }

  async minePatterns(): Promise<MinedPattern[]> {
    const allPatterns: MinedPattern[] = [];
    
    // Generate and evaluate single atom patterns
    const atoms = Array.from(this.atomSpace.values());
    const singlePatterns = this.generator.generateSingleAtomPatterns(atoms);
    
    for (const pattern of singlePatterns) {
      const evaluated = this.evaluator.evaluatePattern(pattern);
      if (this.isSignificant(evaluated)) {
        allPatterns.push(evaluated);
      }
    }

    // Generate and evaluate compound patterns
    const compounds = this.generator.generateCompoundPatterns(
      allPatterns.map(p => p.pattern)
    );

    for (const pattern of compounds) {
      const evaluated = this.evaluator.evaluatePattern(pattern);
      if (this.isSignificant(evaluated)) {
        allPatterns.push(evaluated);
      }
    }

    // Generate and evaluate recursive patterns
    const recursivePatterns = allPatterns
      .filter(p => p.support > this.config.minSupport * 1.5)
      .flatMap(p => this.generator.generateRecursivePatterns(
        p.pattern,
        this.config.maxDepth
      ));

    for (const pattern of recursivePatterns) {
      const evaluated = this.evaluator.evaluatePattern(pattern);
      if (this.isSignificant(evaluated)) {
        allPatterns.push(evaluated);
      }
    }

    return this.rankPatterns(allPatterns)
      .slice(0, this.config.maxPatterns);
  }

  private isSignificant(pattern: MinedPattern): boolean {
    return pattern.support >= this.config.minSupport &&
           pattern.confidence >= this.config.minConfidence;
  }

  private rankPatterns(patterns: MinedPattern[]): MinedPattern[] {
    return patterns.sort((a, b) => {
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
    });
  }
}</content>