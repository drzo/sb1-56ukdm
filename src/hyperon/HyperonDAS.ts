import { v4 as uuidv4 } from 'uuid';
import { Atom } from '../types/Atom';
import { Node } from '../types/Node';
import { Link } from '../types/Link';
import { NodeType, LinkType } from '../types/AtomTypes';
import { BrowserAtomDB } from '../distributed/BrowserAtomDB';

export type QueryPattern = {
  type?: NodeType | LinkType;
  name?: string;
  truthValue?: {
    strength?: [number, number];
    confidence?: [number, number];
  };
};

export class HyperonDAS {
  private nodeId: string;
  private atomDB: BrowserAtomDB;

  constructor() {
    this.nodeId = uuidv4();
    this.atomDB = new BrowserAtomDB(`hyperon-${this.nodeId}`);
  }

  async addNode(type: NodeType, name: string, tv?: { strength: number; confidence: number }): Promise<Node> {
    const node = new Node(type, name, tv);
    await this.atomDB.saveAtom(node);
    return node;
  }

  async addLink(type: LinkType, outgoing: Atom[], tv?: { strength: number; confidence: number }): Promise<Link> {
    const link = new Link(type, outgoing, tv);
    await this.atomDB.saveAtom(link);
    return link;
  }

  async query(pattern: QueryPattern): Promise<Atom[]> {
    const allAtoms = await this.atomDB.getAllAtoms();
    return allAtoms.filter(atom => this.matchesPattern(atom, pattern));
  }

  async getAllAtoms(): Promise<Atom[]> {
    return this.atomDB.getAllAtoms();
  }

  private matchesPattern(atom: Atom, pattern: QueryPattern): boolean {
    if (pattern.type && atom.getType() !== pattern.type) {
      return false;
    }

    if (pattern.name && atom instanceof Node) {
      if ((atom as Node).getName() !== pattern.name) {
        return false;
      }
    }

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

  async findSimilar(atom: Atom, threshold: number = 0.8): Promise<Atom[]> {
    const allAtoms = await this.atomDB.getAllAtoms();
    return allAtoms.filter(other => {
      if (atom.getType() !== other.getType()) return false;
      
      const tv1 = atom.getTruthValue();
      const tv2 = other.getTruthValue();
      
      const strengthDiff = Math.abs(tv1.strength - tv2.strength);
      const confidenceDiff = Math.abs(tv1.confidence - tv2.confidence);
      
      const similarity = 1 - (strengthDiff + confidenceDiff) / 2;
      return similarity >= threshold;
    });
  }

  async clear(): Promise<void> {
    await this.atomDB.clear();
  }
}