import { Atom, Pattern, BindingMap, MatchContext, MatchResult } from '../../../types';
import { matchPattern } from '../pattern-matcher';

export function handleOutgoingLinks(
  atom: Atom,
  pattern: Pattern,
  bindings: BindingMap,
  context: MatchContext
): MatchResult | null {
  if (!pattern.outgoing || !atom.outgoing) return null;
  if (pattern.outgoing.length !== atom.outgoing.length) return null;

  const outgoingResults = pattern.outgoing.map((p, i) => {
    const targetAtom = context.atomSpace.get(atom.outgoing![i]);
    if (!targetAtom) return null;
    
    return typeof p === 'string'
      ? p === targetAtom.id
        ? { matched: true, matchedAtoms: [targetAtom], bindings, depth: context.depth + 1 }
        : null
      : matchPattern(targetAtom, p, { ...bindings }, {
          ...context,
          depth: context.depth + 1,
          visited: new Set([...context.visited, atom.id])
        });
  });

  if (outgoingResults.some(r => !r)) return null;

  const allMatches = [atom, ...outgoingResults.flatMap(r => r!.matchedAtoms)];
  const mergedBindings = outgoingResults.reduce(
    (acc, r) => ({ ...acc, ...r!.bindings }),
    bindings
  );

  return {
    matched: true,
    matchedAtoms: allMatches,
    bindings: mergedBindings,
    depth: context.depth
  };
}