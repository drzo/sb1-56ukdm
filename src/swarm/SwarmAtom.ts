import { Atom, TruthValue } from '../types/Atom';
import { NodeType, LinkType } from '../types/AtomTypes';
import { SwarmNodeType, SwarmLinkType } from '../types/SwarmTypes';

export class SwarmAtom extends Atom {
  private swarmType: SwarmNodeType | SwarmLinkType;
  private metadata: Record<string, any>;

  constructor(
    type: SwarmNodeType | SwarmLinkType,
    id: string,
    tv?: TruthValue,
    metadata: Record<string, any> = {}
  ) {
    const atomType = type === SwarmNodeType.AGENT ? NodeType.AGENT :
                     type === SwarmNodeType.TASK ? NodeType.TASK :
                     type === SwarmNodeType.GOAL ? NodeType.GOAL :
                     type === SwarmLinkType.COLLABORATES ? LinkType.COLLABORATES :
                     NodeType.CONCEPT;
    super(atomType, id, tv);
    this.swarmType = type;
    this.metadata = metadata;
  }

  getSwarmType(): SwarmNodeType | SwarmLinkType {
    return this.swarmType;
  }

  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  updateMetadata(updates: Record<string, any>): void {
    Object.assign(this.metadata, updates);
  }
}