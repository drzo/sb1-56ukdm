import { Atom, Pattern, MatchResult } from '../../types';
import { MatchContext } from '../context/match-context';
import { BasePatternStrategy } from './pattern-strategy';
import { PatternResult } from '../core/pattern-result';
import { PatternMatcher } from '../core/pattern-matcher';

export class LogicalPatternStrategy extends BasePatternStrategy {
  constructor(private matcher: PatternMatcher) {
    super();
  }

  match(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null {
    if (!pattern.operator || !pattern.patterns) return null;

    switch (pattern.operator) {
      case 'AND':
        return this.matchAnd(atom, pattern, context);
      case 'OR':
        return this.matchOr(atom, pattern, context);
      case 'NOT':
        return this.matchNot(atom, pattern, context);
      default:
        return null;
    }
  }

  private matchAnd(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null {
    const results = pattern.patterns!.map(p => {
      const newContext = context.clone();
      newContext.incrementDepth();
      newContext.visitAtom(atom.id);
      return this.matcher.match(atom, p, newContext);
    });

    if (results.some(r => !r)) return null;
    return PatternResult.merge(results.filter((r): r is MatchResult => r !== null));
  }

  private matchOr(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null {
    for (const p of pattern.patterns!) {
      const newContext = context.clone();
      newContext.incrementDepth();
      newContext.visitAtom(atom.id);
      
      const result = this.matcher.match(atom, p, newContext);
      if (result) return result;
    }
    return null;
  }

  private matchNot(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null {
    const newContext = context.clone();
    newContext.incrementDepth();
    newContext.visitAtom(atom.id);

    const result = this.matcher.match(atom, pattern.patterns![0], newContext);
    return result ? null : new PatternResult()
      .addMatchedAtom(atom)
      .mergeBindings(context.getAllBindings())
      .setDepth(context.getDepth())
      .build();
  }
}