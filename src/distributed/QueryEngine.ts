import { Atom } from '../types/Atom';
import { AtomType } from '../types/AtomTypes';
import { DistributedAtomSpace } from './DistributedAtomSpace';

type QueryPattern = {
  type?: AtomType;
  truthValueStrength?: [number, number]; // [min, max]
  truthValueConfidence?: [number, number]; // [min, max]
};

export class QueryEngine {
  private atomspace: DistributedAtomSpace;

  constructor(atomspace: DistributedAtomSpace) {
    this.atomspace = atomspace;
  }

  async query(pattern: QueryPattern): Promise<Atom[]> {
    const allAtoms = await this.atomspace.getAllAtoms();
    
    return allAtoms.filter(atom => {
      // Match type if specified
      if (pattern.type && atom.getType() !== pattern.type) {
        return false;
      }

      // Match truth value strength range if specified
      if (pattern.truthValueStrength) {
        const [min, max] = pattern.truthValueStrength;
        const strength = atom.getTruthValue().strength;
        if (strength < min || strength > max) {
          return false;
        }
      }

      // Match truth value confidence range if specified
      if (pattern.truthValueConfidence) {
        const [min, max] = pattern.truthValueConfidence;
        const confidence = atom.getTruthValue().confidence;
        if (confidence < min || confidence > max) {
          return false;
        }
      }

      return true;
    });
  }

  async findSimilarAtoms(atom: Atom, similarityThreshold: number = 0.8): Promise<Atom[]> {
    const allAtoms = await this.atomspace.getAllAtoms();
    
    return allAtoms.filter(other => {
      if (atom.getType() !== other.getType()) return false;
      
      const tv1 = atom.getTruthValue();
      const tv2 = other.getTruthValue();
      
      // Calculate similarity based on truth values
      const strengthDiff = Math.abs(tv1.strength - tv2.strength);
      const confidenceDiff = Math.abs(tv1.confidence - tv2.confidence);
      
      const similarity = 1 - (strengthDiff + confidenceDiff) / 2;
      return similarity >= similarityThreshold;
    });
  }
}