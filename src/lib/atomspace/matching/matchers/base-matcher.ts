import { Atom, Pattern, BindingMap, MatchResult } from '../../types';
import { PatternContext } from '../core/pattern-context';
import { PatternResult } from '../core/pattern-result';
import { PatternValidator } from '../validation/pattern-validator';

export abstract class BaseMatcher {
  abstract match(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: PatternContext
  ): MatchResult | null;

  protected validateMatch(
    atom: Atom,
    pattern: Pattern,
    context: PatternContext
  ): boolean {
    if (!PatternValidator.validate(pattern)) return false;
    if (!atom) return false;

    // Match type and name if specified
    if (pattern.type && pattern.type !== atom.type) return false;
    if (pattern.name && pattern.name !== atom.name) return false;

    return true;
  }

  protected createResult(
    atom: Atom,
    bindings: BindingMap,
    context: PatternContext
  ): MatchResult {
    return new PatternResult()
      .addMatchedAtom(atom)
      .mergeBindings(bindings)
      .setDepth(context.getDepth())
      .build();
  }

  protected handleCyclicPaths(
    result: PatternResult,
    context: PatternContext
  ): void {
    if (context.hasCycles()) {
      result.setCyclicPaths(context.getCyclicPaths());
    }
  }
}