import { Atom } from '../../types/Atom';
import { Node } from '../../types/Node';
import { Link } from '../../types/Link';
import { NodeType, LinkType } from '../../types/AtomTypes';
import { AtomSpaceCore } from '../core/AtomSpaceCore';

export interface Pattern {
  type?: NodeType | LinkType;
  name?: string;
  outgoing?: Pattern[];
  truthValue?: {
    strength?: [number, number];
    confidence?: [number, number];
  };
}

export class PatternMatcher {
  private atomspace: AtomSpaceCore;

  constructor(atomspace: AtomSpaceCore) {
    this.atomspace = atomspace;
  }

  findMatches(pattern: Pattern): Atom[] {
    if (!pattern.type) {
      return this.getAllAtoms();
    }

    const typeMatches = this.atomspace.getAtomsByType(pattern.type);
    return typeMatches.filter(atom => this.matchesPattern(atom, pattern));
  }

  private matchesPattern(atom: Atom, pattern: Pattern): boolean {
    // Check type
    if (pattern.type && atom.getType() !== pattern.type) {
      return false;
    }

    // Check name for nodes
    if (atom instanceof Node && pattern.name) {
      if ((atom as Node).getName() !== pattern.name) {
        return false;
      }
    }

    // Check outgoing set for links
    if (atom instanceof Link && pattern.outgoing) {
      const outgoing = atom.getOutgoingSet();
      if (outgoing.length !== pattern.outgoing.length) {
        return false;
      }

      for (let i = 0; i < outgoing.length; i++) {
        if (!this.matchesPattern(outgoing[i], pattern.outgoing[i])) {
          return false;
        }
      }
    }

    // Check truth value
    if (pattern.truthValue) {
      const tv = atom.getTruthValue();
      
      if (pattern.truthValue.strength) {
        const [min, max] = pattern.truthValue.strength;
        if (tv.strength < min || tv.strength > max) {
          return false;
        }
      }

      if (pattern.truthValue.confidence) {
        const [min, max] = pattern.truthValue.confidence;
        if (tv.confidence < min || tv.confidence > max) {
          return false;
        }
      }
    }

    return true;
  }

  private getAllAtoms(): Atom[] {
    const atoms: Atom[] = [];
    for (const type of [...Object.values(NodeType), ...Object.values(LinkType)]) {
      atoms.push(...this.atomspace.getAtomsByType(type));
    }
    return atoms;
  }
}