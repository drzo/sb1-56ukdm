import { Atom, Pattern, MatchResult } from '../../types';
import { MatchContext } from '../context/match-context';
import { BasePatternStrategy } from './pattern-strategy';
import { PatternResult } from '../core/pattern-result';

export class SimplePatternStrategy extends BasePatternStrategy {
  match(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null {
    if (!this.validateMatch(atom, pattern)) return null;

    return new PatternResult()
      .addMatchedAtom(atom)
      .setDepth(context.getDepth())
      .build();
  }
}