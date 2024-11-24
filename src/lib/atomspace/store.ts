import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Atom, AtomType, Pattern, QueryResult } from '../types/atom';

interface AtomSpaceState {
  atoms: Map<string, Atom>;
  addAtom: (atom: Atom) => void;
  removeAtom: (id: string) => void;
  getAtom: (id: string) => Atom | undefined;
  getAtomsByType: (type: AtomType) => Atom[];
  findPatterns: (pattern: Pattern) => QueryResult[];
}

export const useAtomSpace = create<AtomSpaceState>((set, get) => ({
  atoms: new Map<string, Atom>(),
  
  addAtom: (atom: Atom) => {
    const atoms = new Map(get().atoms);
    atom.id = atom.id || uuidv4();
    atoms.set(atom.id, atom);
    set({ atoms });
  },
  
  removeAtom: (id: string) => {
    const atoms = new Map(get().atoms);
    atoms.delete(id);
    set({ atoms });
  },
  
  getAtom: (id: string) => {
    return get().atoms.get(id);
  },
  
  getAtomsByType: (type: AtomType) => {
    return Array.from(get().atoms.values()).filter(atom => atom.type === type);
  },

  findPatterns: (pattern: Pattern): QueryResult[] => {
    // Basic pattern matching implementation
    const results: QueryResult[] = [];
    const atoms = Array.from(get().atoms.values());

    atoms.forEach(atom => {
      if (pattern.type && atom.type !== pattern.type) return;
      if (pattern.name && atom.name !== pattern.name) return;

      results.push({
        atoms: [atom],
        bindings: {},
        depth: 0
      });
    });

    return results;
  }
}));