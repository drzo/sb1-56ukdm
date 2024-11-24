import { Atom } from '../../../types';

export class HebbianUtils {
  constructor(private atomSpace: Map<string, Atom>) {}

  getHebbianStrength(source: Atom, target: Atom): number {
    const hebbianLink = this.findHebbianLink(source, target);
    if (!hebbianLink?.truthValue) return 0.5;

    return hebbianLink.truthValue.strength;
  }

  findHebbianLink(source: Atom, target: Atom): Atom | undefined {
    return Array.from(this.atomSpace.values()).find(atom =>
      atom.type === 'HebbianLink' &&
      atom.outgoing?.includes(source.id) &&
      atom.outgoing?.includes(target.id)
    );
  }

  hasIndirectConnection(source: Atom, target: Atom, depth: number = 2): boolean {
    if (depth === 0) return false;

    const directConnections = source.outgoing || [];
    if (directConnections.includes(target.id)) return true;

    return directConnections.some(id => {
      const intermediateAtom = this.atomSpace.get(id);
      return intermediateAtom && this.hasIndirectConnection(intermediateAtom, target, depth - 1);
    });
  }

  getHebbianNeighbors(atom: Atom): Atom[] {
    return Array.from(this.atomSpace.values())
      .filter(other => 
        other.id !== atom.id &&
        this.findHebbianLink(atom, other) !== undefined
      );
  }
}