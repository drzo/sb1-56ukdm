import { Atom, Pattern, BindingMap, MatchResult } from '../../types';
import { PatternContext } from '../core/pattern-context';
import { PatternResult } from '../core/pattern-result';
import { BaseMatcher } from './base-matcher';
import { PatternMatcher } from '../core/pattern-matcher';

export class LinkMatcher extends BaseMatcher {
  constructor(private matcher: PatternMatcher) {
    super();
  }

  match(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    context: PatternContext
  ): MatchResult | null {
    if (!pattern.outgoing || !atom.outgoing) return null;
    if (pattern.outgoing.length !== atom.outgoing.length) return null;

    const outgoingResults = pattern.outgoing.map((p, i) => {
      const targetAtom = context.getAtomSpace().get(atom.outgoing![i]);
      if (!targetAtom) return null;

      if (typeof p === 'string') {
        return p === targetAtom.id
          ? new PatternResult()
              .addMatchedAtom(targetAtom)
              .mergeBindings(bindings)
              .setDepth(context.getDepth() + 1)
              .build()
          : null;
      }

      const newContext = context.clone();
      newContext.incrementDepth();
      newContext.visitAtom(atom.id);
      return this.matcher.match(targetAtom, p, { ...bindings }, newContext);
    });

    if (outgoingResults.some(r => !r)) return null;

    const validResults = outgoingResults.filter((r): r is MatchResult => r !== null);
    const result = PatternResult.merge(validResults);

    return new PatternResult()
      .addMatchedAtom(atom)
      .addMatchedAtoms(result.matchedAtoms)
      .mergeBindings(result.bindings)
      .setDepth(context.getDepth())
      .build();
  }
}