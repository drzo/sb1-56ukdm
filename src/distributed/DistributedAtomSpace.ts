import { v4 as uuidv4 } from 'uuid';
import { Atom } from '../types/Atom';
import { Node } from '../types/Node';
import { Link } from '../types/Link';
import { NodeType, LinkType } from '../types/AtomTypes';
import { BrowserAtomDB } from './BrowserAtomDB';

export class DistributedAtomSpace {
  private nodeId: string;
  private atomDB: BrowserAtomDB;

  constructor() {
    this.nodeId = uuidv4();
    this.atomDB = new BrowserAtomDB(this.nodeId);
  }

  async connect(): Promise<void> {
    // Simulated connection
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    // Cleanup
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

  async getAtom(id: string): Promise<Atom | null> {
    return this.atomDB.getAtom(id);
  }

  async getAllAtoms(): Promise<Atom[]> {
    return this.atomDB.getAllAtoms();
  }

  async query(pattern: any): Promise<Atom[]> {
    const allAtoms = await this.getAllAtoms();
    return allAtoms.filter(atom => {
      if (pattern.type && atom.getType() !== pattern.type) {
        return false;
      }
      if (pattern.truthValueStrength) {
        const [min, max] = pattern.truthValueStrength;
        const strength = atom.getTruthValue().strength;
        if (strength < min || strength > max) {
          return false;
        }
      }
      return true;
    });
  }
}