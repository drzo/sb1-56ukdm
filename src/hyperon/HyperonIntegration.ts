import { PythonBridge } from '../integrations/PythonBridge';
import { Atom } from '../types/Atom';
import { Node } from '../types/Node';
import { Link } from '../types/Link';
import { NodeType, LinkType } from '../types/AtomTypes';

export class HyperonIntegration {
  private bridge: PythonBridge;

  constructor() {
    this.bridge = new PythonBridge();
  }

  async connect(): Promise<void> {
    await this.bridge.connect();
  }

  async addAtom(atom: Atom): Promise<void> {
    const hyperonAtom = this.convertToHyperonAtom(atom);
    await this.bridge.hyperonQuery('add_atom', hyperonAtom);
  }

  async getAtom(id: string): Promise<Atom | null> {
    const result = await this.bridge.hyperonQuery('get_atom', { id });
    return result ? this.convertFromHyperonAtom(result) : null;
  }

  async queryAtoms(pattern: any): Promise<Atom[]> {
    const results = await this.bridge.hyperonQuery('query_atoms', pattern);
    return results.map((result: any) => this.convertFromHyperonAtom(result));
  }

  private convertToHyperonAtom(atom: Atom): any {
    if (atom instanceof Node) {
      return {
        type: 'node',
        atomType: atom.getType(),
        name: atom.getName(),
        truthValue: atom.getTruthValue()
      };
    } else if (atom instanceof Link) {
      return {
        type: 'link',
        atomType: atom.getType(),
        outgoing: atom.getOutgoingSet().map(a => a.getId()),
        truthValue: atom.getTruthValue()
      };
    }
    throw new Error('Unknown atom type');
  }

  private convertFromHyperonAtom(data: any): Atom {
    if (data.type === 'node') {
      return new Node(
        data.atomType as NodeType,
        data.name,
        data.truthValue
      );
    } else if (data.type === 'link') {
      const outgoing = data.outgoing.map((id: string) => 
        new Node(NodeType.CONCEPT, id)
      );
      return new Link(
        data.atomType as LinkType,
        outgoing,
        data.truthValue
      );
    }
    throw new Error('Unknown Hyperon atom type');
  }

  async disconnect(): Promise<void> {
    this.bridge.disconnect();
  }
}