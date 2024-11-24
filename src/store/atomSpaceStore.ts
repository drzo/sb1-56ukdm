import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Atom, AtomType, Pattern, TruthValue } from '../types/atom';
import { MemoryInstance } from '../types/memory';

interface AtomSpaceState {
  atoms: Map<string, Atom>;
  instances: Map<string, MemoryInstance>;
  heightIndices: Map<number, Set<string>>;

  // Atom operations
  addAtom: (atom: Omit<Atom, 'id'>) => string;
  removeAtom: (id: string) => void;
  getAtom: (id: string) => Atom | undefined;
  getAtomsByType: (type: AtomType) => Atom[];
  
  // Instance operations
  addInstance: (instance: Omit<MemoryInstance, 'id'>) => string;
  removeInstance: (id: string) => void;
  
  // Height-based operations
  getAtomsAtHeight: (height: number) => Atom[];
  linkAtoms: (sourceId: string, targetId: string, height: number) => void;
}

export const useAtomSpace = create<AtomSpaceState>((set, get) => ({
  atoms: new Map(),
  instances: new Map(),
  heightIndices: new Map(),

  addAtom: (atom) => {
    const id = uuidv4();
    const newAtom = { ...atom, id };
    
    set(state => {
      const atoms = new Map(state.atoms).set(id, newAtom);
      
      // Update height indices if height is specified
      if (atom.height !== undefined) {
        const heightSet = state.heightIndices.get(atom.height) || new Set();
        heightSet.add(id);
        const heightIndices = new Map(state.heightIndices).set(atom.height, heightSet);
        return { atoms, heightIndices };
      }
      
      return { atoms };
    });

    return id;
  },

  removeAtom: (id) => {
    set(state => {
      const atom = state.atoms.get(id);
      const atoms = new Map(state.atoms);
      atoms.delete(id);

      if (atom?.height !== undefined) {
        const heightSet = state.heightIndices.get(atom.height);
        if (heightSet) {
          heightSet.delete(id);
          const heightIndices = new Map(state.heightIndices);
          if (heightSet.size === 0) {
            heightIndices.delete(atom.height);
          } else {
            heightIndices.set(atom.height, heightSet);
          }
          return { atoms, heightIndices };
        }
      }

      return { atoms };
    });
  },

  getAtom: (id) => get().atoms.get(id),

  getAtomsByType: (type) => 
    Array.from(get().atoms.values()).filter(atom => atom.type === type),

  addInstance: (instance) => {
    const id = uuidv4();
    const newInstance = { ...instance, id };
    
    set(state => ({
      instances: new Map(state.instances).set(id, newInstance)
    }));

    return id;
  },

  removeInstance: (id) => {
    set(state => {
      const instances = new Map(state.instances);
      instances.delete(id);
      return { instances };
    });
  },

  getAtomsAtHeight: (height) => {
    const heightSet = get().heightIndices.get(height);
    if (!heightSet) return [];
    
    return Array.from(heightSet)
      .map(id => get().atoms.get(id))
      .filter((atom): atom is Atom => atom !== undefined);
  },

  linkAtoms: (sourceId, targetId, height) => {
    set(state => {
      const sourceAtom = state.atoms.get(sourceId);
      const targetAtom = state.atoms.get(targetId);
      
      if (!sourceAtom || !targetAtom) return state;

      const updatedSourceAtom = {
        ...sourceAtom,
        outgoing: [...(sourceAtom.outgoing || []), targetId],
        height
      };

      const atoms = new Map(state.atoms).set(sourceId, updatedSourceAtom);
      
      // Update height indices
      const heightSet = state.heightIndices.get(height) || new Set();
      heightSet.add(sourceId);
      const heightIndices = new Map(state.heightIndices).set(height, heightSet);

      return { atoms, heightIndices };
    });
  }
}));