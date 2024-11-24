import { Atom, Pattern, BindingMap, MatchResult } from '../../types';
import { PatternContext } from '../core/pattern-context';
import { PatternResult } from '../core/pattern-result';
import { BaseMatcher } from './base-matcher';

export class VariableMatcher extends BaseMatcher {
  match(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: PatternContext
  ): MatchResult | null {
    if (!pattern.isVariable || !pattern.variableName) return null;

    const existingBinding = bindings[pattern.variableName];
    if (existingBinding) {
      return existingBinding.id === atom.id
        ? this.createResult(atom, bindings, context)
        : null;
    }

    return new PatternResult()
      .addMatchedAtom(atom)
      .addBinding(pattern.variableName, atom)
      .setDepth(context.getDepth())
      .build();
  }
}