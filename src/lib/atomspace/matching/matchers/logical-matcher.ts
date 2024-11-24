import { Atom, Pattern, BindingMap, MatchResult } from '../../types';
import { PatternContext } from '../core/pattern-context';
import { PatternResult } from '../core/pattern-result';
import { BaseMatcher } from './base-matcher';
import { PatternMatcher } from '../core/pattern-matcher';

export class LogicalMatcher extends BaseMatcher {
  constructor(private matcher: PatternMatcher) {
    super();
  }

  match(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: PatternContext
  ): MatchResult | null {
    if (!pattern.operator || !pattern.patterns) return null;

    switch (pattern.operator) {
      case 'AND':
        return this.matchAnd(atom, pattern, bindings, context);
      case 'OR':
        return this.matchOr(atom, pattern, bindings, context);
      case 'NOT':
        return this.matchNot(atom, pattern, bindings, context);
      default:
        return null;
    }
  }

  private matchAnd(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: PatternContext
  ): MatchResult | null {
    const results = pattern.patterns!.map(p => {
      const newContext = context.clone();
      newContext.incrementDepth();
      newContext.visitAtom(atom.id);
      return this.matcher.match(atom, p, { ...bindings }, newContext);
    });

    if (results.some(r => !r)) return null;

    return PatternResult.merge(results.filter((r): r is MatchResult => r !== null));
  }

  private matchOr(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: PatternContext
  ): MatchResult | null {
    for (const p of pattern.patterns!) {
      const newContext = context.clone();
      newContext.incrementDepth();
      newContext.visitAtom(atom.id);
      
      const result = this.matcher.match(atom, p, { ...bindings }, newContext);
      if (result) return result;
    }
    return null;
  }

  private matchNot(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: PatternContext
  ): MatchResult | null {
    const newContext = context.clone();
    newContext.incrementDepth();
    newContext.visitAtom(atom.id);

    const result = this.matcher.match(
      atom,
      pattern.patterns![0],
      { ...bindings },
      newContext
    );

    return result ? null : this.createResult(atom, bindings, context);
  }
}