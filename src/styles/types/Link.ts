import { Atom, TruthValue } from './Atom';
import { LinkType, isValidLinkType } from './AtomTypes';

export class Link extends Atom {
  private outgoing: Atom[];

  constructor(type: LinkType, outgoing: Atom[], tv?: TruthValue) {
    if (!isValidLinkType(type)) {
      throw new Error(`Invalid link type: ${type}`);
    }
    const id = `${type}:(${outgoing.map(atom => atom.getId()).join(',')})`;
    super(type, id, tv);
    this.outgoing = [...outgoing];
  }

  getOutgoingSet(): Atom[] {
    return [...this.outgoing];
  }
}