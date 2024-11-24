import { Atom, Pattern, BindingMap, MatchContext, MatchResult } from '../../types';
import { matchPattern } from './pattern-matcher';

export function handleRecursion(
  atom: Atom,
  pattern: Pattern,
  bindings: BindingMap,
  context: MatchContext
): MatchResult | null {
  // Check recursion depth
  if (pattern.recursive?.maxDepth !== undefined && context.depth > pattern.recursive.maxDepth) {
    return null;
  }

  // Detect cycles if enabled
  if (pattern.recursive?.detectCycles && context.visited.has(atom.id)) {
    return null;
  }

  // Follow links if enabled
  if (pattern.recursive?.followLinks && atom.outgoing) {
    const outgoingResults = atom.outgoing.map(targetId => {
      const targetAtom = context.atomSpace.get(targetId);
      if (!targetAtom) return null;
      
      return matchPattern(targetAtom, pattern, { ...bindings }, {
        ...context,
        depth: context.depth + 1,
        visited: new Set([...context.visited, atom.id])
      });
    });

    const validResults = outgoingResults.filter((r): r is MatchResult => r !== null);
    if (validResults.length === 0) return null;

    const allMatches = [atom, ...validResults.flatMap(r => r.matchedAtoms)];
    const mergedBindings = validResults.reduce(
      (acc, r) => ({ ...acc, ...r.bindings }),
      bindings
    );

    return {
      matched: true,
      matchedAtoms: allMatches,
      bindings: mergedBindings,
      depth: context.depth
    };
  }

  return null;
}