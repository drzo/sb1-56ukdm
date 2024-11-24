import { Atom, Pattern, BindingMap, MatchResult } from '../../types';
import { PatternContext } from '../core/pattern-context';
import { PatternResult } from '../core/pattern-result';
import { BaseMatcher } from './base-matcher';
import { PatternMatcher } from '../core/pattern-matcher';

export class RecursiveMatcher extends BaseMatcher {
  constructor(private matcher: PatternMatcher) {
    super();
  }

  match(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: PatternContext
  ): MatchResult | null {
    if (!pattern.recursive) return null;

    // Check recursion depth
    if (pattern.recursive.maxDepth !== undefined && 
        context.getDepth() > pattern.recursive.maxDepth) {
      return null;
    }

    // Detect cycles if enabled
    if (pattern.recursive.detectCycles && context.isAtomVisited(atom.id)) {
      return null;
    }

    // Match current atom
    const currentMatch = this.matcher.match(
      atom,
      { ...pattern, recursive: undefined },
      bindings,
      context
    );

    if (!currentMatch) return null;

    // Follow outgoing links if enabled
    if (pattern.recursive.followLinks && atom.outgoing) {
      return this.handleRecursiveLinks(
        atom,
        pattern,
        currentMatch,
        context
      );
    }

    return currentMatch;
  }

  private handleRecursiveLinks(
    atom: Atom,
    pattern: Pattern,
    currentMatch: MatchResult,
    context: PatternContext
  ): MatchResult | null {
    const recursiveResults: MatchResult[] = [];

    for (const targetId of atom.outgoing!) {
      const targetAtom = context.getAtomSpace().get(targetId);
      if (!targetAtom) continue;

      const newContext = context.clone();
      newContext.incrementDepth();
      newContext.incrementRecursiveDepth();
      newContext.visitAtom(atom.id);

      const result = this.match(
        targetAtom,
        pattern,
        { ...currentMatch.bindings },
        newContext
      );

      if (result) {
        recursiveResults.push(result);
      }
    }

    if (recursiveResults.length === 0) {
      return currentMatch;
    }

    const mergedResults = PatternResult.merge(recursiveResults);

    return new PatternResult()
      .addMatchedAtom(atom)
      .addMatchedAtoms(mergedResults.matchedAtoms)
      .mergeBindings(mergedResults.bindings)
      .setDepth(context.getDepth())
      .setRecursiveDepth(Math.max(
        context.getRecursiveDepth(),
        ...recursiveResults.map(r => r.depth)
      ))
      .setCyclicPaths(context.getCyclicPaths())
      .build();
  }
}