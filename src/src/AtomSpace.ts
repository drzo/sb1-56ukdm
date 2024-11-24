import { Atom } from './types/Atom';
import { Node } from './types/Node';
import { Link } from './types/Link';
import { NodeType, LinkType } from './types/AtomTypes';

export class AtomSpace {
  private atoms: Map<string, Atom>;

  constructor() {
    this.atoms = new Map();
  }

  addNode(type: NodeType, name: string): Node {
    const node = new Node(type, name);
    const id = node.getId();
    
    if (!this.atoms.has(id)) {
      this.atoms.set(id, node);
    }
    
    return this.atoms.get(id) as Node;
  }

  addLink(type: LinkType, outgoing: Atom[]): Link {
    const link = new Link(type, outgoing);
    const id = link.getId();
    
    if (!this.atoms.has(id)) {
      this.atoms.set(id, link);
    }
    
    return this.atoms.get(id) as Link;
  }

  getAtom(id: string): Atom | undefined {
    return this.atoms.get(id);
  }

  removeAtom(id: string): boolean {
    return this.atoms.delete(id);
  }

  getAtomCount(): number {
    return this.atoms.size;
  }

  getAllAtoms(): Atom[] {
    return Array.from(this.atoms.values());
  }

  getAtomsByType(type: NodeType | LinkType): Atom[] {
    return Array.from(this.atoms.values()).filter(atom => atom.getType() === type);
  }
}