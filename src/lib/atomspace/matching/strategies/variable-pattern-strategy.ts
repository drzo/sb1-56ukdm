import { Atom, Pattern, MatchResult } from '../../types';
import { MatchContext } from '../context/match-context';
import { BasePatternStrategy } from './pattern-strategy';
import { PatternResult } from '../core/pattern-result';
import { TypeValidator } from '../../types/type-validation';
import { TypeInferenceContext } from '../../types/type-inference-context';

export class VariablePatternStrategy extends BasePatternStrategy {
  match(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null {
    if (!pattern.isVariable || !pattern.variableName) return null;

    const typeValidator = context.getTypeValidator();
    const typeContext = context.getTypeContext();

    // Validate type constraints
    if (!this.validateMatch(atom, pattern, typeValidator)) {
      return null;
    }

    // Check existing variable binding
    const existingBinding = context.getBinding(pattern.variableName);
    if (existingBinding) {
      return existingBinding.id === atom.id
        ? this.createResult(atom, context)
        : null;
    }

    // Update type inference context
    if (pattern.type) {
      typeContext.addInferredType(pattern.variableName, pattern.type);
    }

    // Add new binding
    context.addBinding(pattern.variableName, atom);
    return this.createResult(atom, context);
  }

  private createResult(atom: Atom, context: MatchContext): MatchResult {
    return new PatternResult()
      .addMatchedAtom(atom)
      .mergeBindings(context.getAllBindings())
      .setDepth(context.getDepth())
      .build();
  }
}