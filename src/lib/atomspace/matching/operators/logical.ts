import { Atom, Pattern, BindingMap, MatchContext, MatchResult } from '../../../types';
import { matchPattern } from '../pattern-matcher';

export function handleLogicalOperator(
  atom: Atom,
  pattern: Pattern,
  bindings: BindingMap,
  context: MatchContext
): MatchResult | null {
  if (!pattern.operator || !pattern.patterns) return null;

  switch (pattern.operator) {
    case 'AND': {
      const results = pattern.patterns.map(p => 
        matchPattern(atom, p, { ...bindings }, { 
          ...context, 
          depth: context.depth + 1,
          visited: new Set([...context.visited, atom.id])
        })
      );
      if (results.some(r => !r)) return null;
      
      const allMatches = results.flatMap(r => r!.matchedAtoms);
      const mergedBindings = results.reduce((acc, r) => ({ ...acc, ...r!.bindings }), {});
      return {
        matched: true,
        matchedAtoms: allMatches,
        bindings: mergedBindings,
        depth: context.depth
      };
    }
    
    case 'OR': {
      for (const p of pattern.patterns) {
        const result = matchPattern(atom, p, { ...bindings }, {
          ...context,
          depth: context.depth + 1,
          visited: new Set([...context.visited, atom.id])
        });
        if (result) return result;
      }
      return null;
    }
    
    case 'NOT': {
      const result = matchPattern(atom, pattern.patterns[0], { ...bindings }, {
        ...context,
        depth: context.depth + 1,
        visited: new Set([...context.visited, atom.id])
      });
      return result ? null : { 
        matched: true, 
        matchedAtoms: [atom], 
        bindings, 
        depth: context.depth 
      };
    }

    default:
      return null;
  }
}