import { Atom, Pattern, MatchResult } from '../../types';
import { MatchContext } from '../context/match-context';
import { BasePatternStrategy } from './pattern-strategy';
import { PatternResult } from '../core/pattern-result';
import { PatternMatcher } from '../core/pattern-matcher';

export class RecursivePatternStrategy extends BasePatternStrategy {
  constructor(private matcher: PatternMatcher) {
    super();
  }

  match(
    atom: Atom,
    pattern: Pattern,
    context: MatchContext
  ): MatchResult | null {
    if (!pattern.recursive) return null;

    // Check recursion depth
    if (pattern.recursive.maxDepth !== undefined && 
        context.getDepth() > pattern.recursive.maxDepth) {
      return null;
    }

    // Check for cycles
    if (pattern.recursive.detectCycles && context.isAtomVisited(atom.id)) {
      return null;
    }

    // Match current atom
    const currentMatch = this.matcher.match(
      atom,
      { ...pattern, recursive: undefined },
      context
    );

    if (!currentMatch) return null;

    // Follow outgoing links if enabled
    if (pattern.recursive.followLinks && atom.outgoing) {
      return this.handleRecursiveLinks(atom, pattern, currentMatch, context);
    }

    return currentMatch;
  }

  private handleRecursiveLinks(
    atom: Atom,
    pattern: Pattern,
    currentMatch: MatchResult,
    context: MatchContext
  ): MatchResult | null {
    const recursiveResults: MatchResult[] = [];

    for (const targetId of atom.outgoing!) {
      const targetAtom = context.getAtom(targetId);
      if (!targetAtom) continue;

      const newContext = context.clone();
      newContext.incrementDepth();
      newContext.incrementRecursiveDepth();
      newContext.visitAtom(atom.id);

      const result = this.match(targetAtom, pattern, newContext);
      if (result) recursiveResults.push(result);
    }

    if (recursiveResults.length === 0) return currentMatch;

    const mergedResults = PatternResult.merge(recursiveResults);

    return new PatternResult()
      .addMatchedAtom(atom)
      .addMatchedAtoms(mergedResults.matchedAtoms)
      .mergeBindings(mergedResults.bindings)
      .setDepth(context.getDepth())
      .setRecursiveDepth(context.getRecursiveDepth())
      .setCyclicPaths(context.getCyclicPaths())
      .build();
  }
}