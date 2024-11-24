import { Atom, TruthValue } from './Atom';
import { NodeType, isValidNodeType } from './AtomTypes';

export class Node extends Atom {
  private name: string;

  constructor(type: NodeType, name: string, tv?: TruthValue) {
    if (!isValidNodeType(type)) {
      throw new Error(`Invalid node type: ${type}`);
    }
    super(type, `${type}:${name}`, tv);
    this.name = name;
  }

  getName(): string {
    return this.name;
  }
}