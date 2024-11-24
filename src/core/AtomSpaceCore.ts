import { Atom } from '../../types/Atom';
import { Node } from '../../types/Node';
import { Link } from '../../types/Link';
import { NodeType, LinkType } from '../../types/AtomTypes';
import { TruthValue } from '../../types/Atom';
import { Logger } from '../../cogutil/Logger';

export class AtomSpace {
  private nodes: Map<string, Node>;
  private links: Map<string, Link>;
  private typeIndex: Map<string, Set<string>>;
  private incomingIndex: Map<string, Set<string>>;

  constructor() {
    this.nodes = new Map();
    this.links = new Map();
    this.typeIndex = new Map();
    this.incomingIndex = new Map();
    Logger.info('AtomSpace initialized');
  }

  addNode(type: NodeType, name: string, tv?: TruthValue): Node {
    const id = `${type}:${name}`;
    let node = this.nodes.get(id);
    
    if (!node) {
      node = new Node(type, name, tv);
      this.nodes.set(id, node);
      this.addToTypeIndex(type, id);
      Logger.debug(`Added node: ${id}`);
    }
    
    return node;
  }

  addLink(type: LinkType, outgoing: Atom[], tv?: TruthValue): Link {
    const id = `${type}:(${outgoing.map(a => a.getId()).join(',')})`;
    let link = this.links.get(id);
    
    if (!link) {
      link = new Link(type, outgoing, tv);
      this.links.set(id, link);
      this.addToTypeIndex(type, id);
      this.updateIncomingIndex(link);
      Logger.debug(`Added link: ${id}`);
    }
    
    return link;
  }

  getAtom(id: string): Atom | undefined {
    return this.nodes.get(id) || this.links.get(id);
  }

  removeAtom(id: string): boolean {
    const atom = this.getAtom(id);
    if (!atom) return false;

    if (this.hasIncoming(id)) {
      Logger.warn(`Cannot remove atom ${id} with incoming links`);
      return false;
    }

    if (atom instanceof Node) {
      this.nodes.delete(id);
    } else {
      this.links.delete(id);
    }

    this.removeFromTypeIndex(atom.getType(), id);
    Logger.debug(`Removed atom: ${id}`);
    return true;
  }

  getAllAtoms(): Atom[] {
    return [...Array.from(this.nodes.values()), ...Array.from(this.links.values())];
  }

  getAtomsByType(type: NodeType | LinkType): Atom[] {
    const ids = this.typeIndex.get(type) || new Set();
    return Array.from(ids).map(id => this.getAtom(id)!).filter(Boolean);
  }

  getIncoming(atom: Atom): Link[] {
    const incomingIds = this.incomingIndex.get(atom.getId()) || new Set();
    return Array.from(incomingIds).map(id => this.links.get(id)!).filter(Boolean);
  }

  private addToTypeIndex(type: string, id: string): void {
    if (!this.typeIndex.has(type)) {
      this.typeIndex.set(type, new Set());
    }
    this.typeIndex.get(type)!.add(id);
  }

  private removeFromTypeIndex(type: string, id: string): void {
    const typeSet = this.typeIndex.get(type);
    if (typeSet) {
      typeSet.delete(id);
    }
  }

  private updateIncomingIndex(link: Link): void {
    link.getOutgoingSet().forEach(atom => {
      if (!this.incomingIndex.has(atom.getId())) {
        this.incomingIndex.set(atom.getId(), new Set());
      }
      this.incomingIndex.get(atom.getId())!.add(link.getId());
    });
  }

  private hasIncoming(id: string): boolean {
    return this.incomingIndex.has(id) && this.incomingIndex.get(id)!.size > 0;
  }
}