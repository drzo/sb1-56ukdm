import { Atom, Pattern, BindingMap, QueryResult } from '../types/atom';

export function matchPattern(
  atom: Atom,
  pattern: Pattern,
  bindings: BindingMap = {},
  depth: number = 0
): QueryResult | null {
  // Match type and name if specified
  if (pattern.type && pattern.type !== atom.type) return null;
  if (pattern.name && pattern.name !== atom.name) return null;

  // Handle variable patterns
  if (pattern.isVariable && pattern.variableName) {
    const existingBinding = bindings[pattern.variableName];
    if (existingBinding) {
      return existingBinding.id === atom.id
        ? { atoms: [atom], bindings, depth }
        : null;
    }
    bindings[pattern.variableName] = atom;
    return { atoms: [atom], bindings, depth };
  }

  // Basic match
  return {
    atoms: [atom],
    bindings,
    depth
  };
}