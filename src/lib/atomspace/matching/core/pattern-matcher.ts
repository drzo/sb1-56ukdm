import { Atom, Pattern, MatchResult } from '../../types';
import { TypeInferenceEngine } from '../../types/type-inference-engine';
import { TypeValidator } from '../../types/type-validation';
import { MatchContext } from './match-context';
import { PatternStrategy } from '../strategies/pattern-strategy';
import { SimplePatternStrategy } from '../strategies/simple-pattern-strategy';
import { VariablePatternStrategy } from '../strategies/variable-pattern-strategy';
import { LogicalPatternStrategy } from '../strategies/logical-pattern-strategy';
import { RecursivePatternStrategy } from '../strategies/recursive-pattern-strategy';

export class PatternMatcher {
  private strategies: PatternStrategy[];
  private typeInferenceEngine: TypeInferenceEngine;
  private typeValidator: TypeValidator;

  constructor(atomSpace: Map<string, Atom>) {
    this.typeInferenceEngine = new TypeInferenceEngine(atomSpace);
    this.typeValidator = new TypeValidator();

    // Register pattern matching strategies in order of precedence
    this.strategies = [
      new RecursivePatternStrategy(this),
      new VariablePatternStrategy(),
      new LogicalPatternStrategy(this),
      new SimplePatternStrategy()
    ];
  }

  match(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null {
    // Validate type consistency of pattern
    if (!this.typeInferenceEngine.validateTypeConsistency(pattern)) {
      return null;
    }

    // Validate type constraints
    if (!this.typeValidator.validateTypeConstraints(atom, pattern)) {
      return null;
    }

    // Try each strategy in order until one succeeds
    for (const strategy of this.strategies) {
      const result = strategy.match(atom, pattern, context);
      if (result) return result;
    }

    return null;
  }

  findPatterns(
    atomSpace: Map<string, Atom>,
    pattern: Pattern
  ): MatchResult[] {
    const results: MatchResult[] = [];
    const context = new MatchContext(atomSpace);

    Array.from(atomSpace.values()).forEach(atom => {
      const match = this.match(atom, pattern, context);
      if (match) results.push(match);
    });

    return results;
  }
}