import { get, set, del, clear, entries } from 'idb-keyval';
import { Atom } from '../types/Atom';
import { Node } from '../types/Node';
import { Link } from '../types/Link';
import { NodeType, LinkType } from '../types/AtomTypes';

export class BrowserAtomDB {
  private prefix: string;

  constructor(dbName: string) {
    this.prefix = `atomspace-${dbName}-`;
  }

  private getKey(id: string): string {
    return `${this.prefix}${id}`;
  }

  async saveAtom(atom: Atom): Promise<void> {
    const key = this.getKey(atom.getId());
    const value = {
      type: atom.getType(),
      truthValue: atom.getTruthValue(),
      ...(atom instanceof Node && { name: (atom as Node).getName() }),
      ...(atom instanceof Link && { outgoing: (atom as Link).getOutgoingSet().map(a => a.getId()) })
    };
    await set(key, JSON.stringify(value));
  }

  async getAtom(id: string): Promise<Atom | null> {
    try {
      const storedValue = await get(this.getKey(id));
      if (!storedValue) return null;

      const value = JSON.parse(storedValue);
      if ('name' in value) {
        return new Node(value.type as NodeType, value.name, value.truthValue);
      } else {
        const outgoing = await Promise.all(
          value.outgoing.map((atomId: string) => this.getAtom(atomId))
        );
        return new Link(value.type as LinkType, outgoing.filter(a => a !== null) as Atom[], value.truthValue);
      }
    } catch (error) {
      return null;
    }
  }

  async removeAtom(id: string): Promise<void> {
    await del(this.getKey(id));
  }

  async getAllAtoms(): Promise<Atom[]> {
    const atoms: Atom[] = [];
    const allEntries = await entries();
    
    for (const [key] of allEntries) {
      if (typeof key === 'string' && key.startsWith(this.prefix)) {
        const atom = await this.getAtom(key.slice(this.prefix.length));
        if (atom) atoms.push(atom);
      }
    }
    
    return atoms;
  }

  async clear(): Promise<void> {
    await clear();
  }
}