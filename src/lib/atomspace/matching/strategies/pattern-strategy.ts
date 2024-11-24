import { Atom, Pattern, MatchResult } from '../../types';
import { MatchContext } from '../core/match-context';

export interface PatternStrategy {
  match(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null;
}

export abstract class BasePatternStrategy implements PatternStrategy {
  abstract match(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null;

  protected validateMatch(atom: Atom, pattern: Pattern): boolean {
    if (!atom || !pattern) return false;
    
    // Match type and name if specified
    if (pattern.type && pattern.type !== atom.type) return false;
    if (pattern.name && pattern.name !== atom.name) return false;

    return true;
  }
}