import { Atom, Pattern, BindingMap, MatchContext } from '../../../types';
import { RecursiveContext } from './recursive-context';
import { RecursiveMatchResult } from './types';
import { validateRecursiveOptions } from './validation';
import { matchPattern } from '../pattern-matcher';

export function handleRecursion(
  atom: Atom,
  pattern: Pattern,
  bindings: BindingMap,
  context: MatchContext
): RecursiveMatchResult | null {
  if (!pattern.recursive || !validateRecursiveOptions(pattern.recursive)) {
    return null;
  }

  const recursiveContext = new RecursiveContext(context);
  recursiveContext.pushPath(atom.id);

  // Check max depth
  if (pattern.recursive.maxDepth !== undefined && 
      recursiveContext.getDepth() > pattern.recursive.maxDepth) {
    return null;
  }

  // Check for cycles if enabled
  if (pattern.recursive.detectCycles && recursiveContext.isAtomVisited(atom.id)) {
    return {
      matched: true,
      matchedAtoms: [atom],
      bindings,
      depth: context.depth,
      recursiveDepth: recursiveContext.getDepth(),
      visitedPaths: recursiveContext.getVisitedPaths(),
      cyclicPaths: recursiveContext.getCyclicPaths()
    };
  }

  // Match current atom
  const currentMatch = matchPattern(atom, {
    ...pattern,
    recursive: undefined // Prevent infinite recursion
  }, bindings, context);

  if (!currentMatch) {
    recursiveContext.popPath();
    return null;
  }

  // Follow outgoing links if enabled
  if (pattern.recursive.followLinks && atom.outgoing) {
    const outgoingResults: RecursiveMatchResult[] = [];

    for (const targetId of atom.outgoing) {
      const targetAtom = context.atomSpace.get(targetId);
      if (!targetAtom) continue;

      const result = handleRecursion(
        targetAtom,
        pattern,
        { ...currentMatch.bindings },
        {
          ...context,
          depth: context.depth + 1
        }
      );

      if (result) {
        outgoingResults.push(result);
      }
    }

    // Combine results
    if (outgoingResults.length > 0) {
      const allMatches = [
        atom,
        ...outgoingResults.flatMap(r => r.matchedAtoms)
      ];

      const mergedBindings = outgoingResults.reduce(
        (acc, r) => ({ ...acc, ...r.bindings }),
        currentMatch.bindings
      );

      const allVisitedPaths = new Set([
        ...recursiveContext.getVisitedPaths(),
        ...outgoingResults.flatMap(r => Array.from(r.visitedPaths))
      ]);

      const allCyclicPaths = outgoingResults
        .filter(r => r.cyclicPaths)
        .flatMap(r => r.cyclicPaths!);

      recursiveContext.popPath();

      return {
        matched: true,
        matchedAtoms: allMatches,
        bindings: mergedBindings,
        depth: context.depth,
        recursiveDepth: recursiveContext.getDepth(),
        visitedPaths: allVisitedPaths,
        cyclicPaths: allCyclicPaths.length > 0 ? allCyclicPaths : undefined
      };
    }
  }

  recursiveContext.popPath();

  // Return match for current atom if no recursive matches found
  return {
    matched: true,
    matchedAtoms: currentMatch.matchedAtoms,
    bindings: currentMatch.bindings,
    depth: context.depth,
    recursiveDepth: recursiveContext.getDepth(),
    visitedPaths: recursiveContext.getVisitedPaths(),
    cyclicPaths: recursiveContext.hasCycle() ? recursiveContext.getCyclicPaths() : undefined
  };
}