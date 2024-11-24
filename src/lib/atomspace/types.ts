import { Atom, Pattern, QueryResult } from '../types/atom';

export interface AtomSpaceState {
  atoms: Map<string, Atom>;
  addAtom: (atom: Atom) => void;
  removeAtom: (id: string) => void;
  getAtom: (id: string) => Atom | undefined;
  getAtomsByType: (type: string) => Atom[];
  findPatterns: (pattern: Pattern) => QueryResult[];
}