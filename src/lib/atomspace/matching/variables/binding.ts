import { Atom, Pattern, BindingMap, MatchResult } from '../../../types';

export function handleVariableBinding(
  atom: Atom,
  pattern: Pattern,
  bindings: BindingMap,
  depth: number
): MatchResult | null {
  if (!pattern.isVariable || !pattern.variableName) return null;

  const existingBinding = bindings[pattern.variableName];
  if (existingBinding) {
    return existingBinding.id === atom.id
      ? { matched: true, matchedAtoms: [atom], bindings, depth }
      : null;
  }

  bindings[pattern.variableName] = atom;
  return { matched: true, matchedAtoms: [atom], bindings, depth };
}