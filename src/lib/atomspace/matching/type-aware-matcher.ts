import { Atom, Pattern, MatchResult } from '../types';
import { TypeInferenceEngine } from '../types/type-inference-engine';
import { TypeValidator } from '../types/type-validation';
import { PatternMatcher } from './core/pattern-matcher';
import { MatchContext } from './context/match-context';

export class TypeAwarePatternMatcher extends PatternMatcher {
  constructor(
    private typeInferenceEngine: TypeInferenceEngine,
    private typeValidator: TypeValidator
  ) {
    super();
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

    // Proceed with regular pattern matching
    return super.match(atom, pattern, context);
  }

  protected matchVariable(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null {
    if (!pattern.isVariable || !pattern.variableName) return null;

    // Check type restrictions
    if (pattern.typeRestriction) {
      if (!this.typeValidator.validateTypeConstraints(atom, pattern)) {
        return null;
      }
    }

    return super.matchVariable(atom, pattern, context);
  }

  protected matchOutgoing(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null {
    if (!pattern.outgoing || !atom.outgoing) return null;

    // Validate outgoing types
    if (!this.typeValidator.validateTypeConstraints(atom, pattern)) {
      return null;
    }

    return super.matchOutgoing(atom, pattern, context);
  }
}