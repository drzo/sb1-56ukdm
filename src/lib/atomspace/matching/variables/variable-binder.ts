import { Atom, Pattern, BindingMap, MatchResult } from '../../../types';

export class VariableBinder {
  static bind(
    atom: Atom,
    pattern: Pattern,
    bindings: BindingMap,
    depth: number
  ): MatchResult | null {
    if (!pattern.isVariable || !pattern.variableName) {
      return null;
    }

    const existingBinding = bindings[pattern.variableName];
    if (existingBinding) {
      return existingBinding.id === atom.id
        ? { matched: true, matchedAtoms: [atom], bindings, depth }
        : null;
    }

    bindings[pattern.variableName] = atom;
    return { matched: true, matchedAtoms: [atom], bindings, depth };
  }

  static validateBinding(
    variableName: string,
    atom: Atom,
    bindings: BindingMap
  ): boolean {
    const existingBinding = bindings[variableName];
    if (!existingBinding) return true;
    return existingBinding.id === atom.id;
  }

  static mergeBindings(
    bindings1: BindingMap,
    bindings2: BindingMap
  ): BindingMap | null {
    const merged: BindingMap = { ...bindings1 };

    for (const [varName, atom] of Object.entries(bindings2)) {
      if (merged[varName] && merged[varName].id !== atom.id) {
        return null;
      }
      merged[varName] = atom;
    }

    return merged;
  }
}