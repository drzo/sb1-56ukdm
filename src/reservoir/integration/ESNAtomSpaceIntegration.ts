import { AtomSpace } from '../../atomspace/core/AtomSpaceCore';
import { ReservoirAtom } from '../ReservoirAtom';
import { ESNConfig, ESNState } from '../types/ESNTypes';
import { NodeType, LinkType } from '../../types/AtomTypes';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

export class ESNAtomSpaceIntegration {
  private atomspace: AtomSpace;
  private reservoirs: Map<string, ReservoirAtom>;

  constructor(atomspace: AtomSpace) {
    this.atomspace = atomspace;
    this.reservoirs = new Map();
  }

  async createESNAtom(id: string, config: ESNConfig): Promise<ReservoirAtom> {
    const timer = new Timer();
    try {
      // Create ESN atom
      const esn = new ReservoirAtom(id, config);
      await esn.initialize();
      this.reservoirs.set(id, esn);

      // Create AtomSpace representation
      const esnNode = this.atomspace.addNode(NodeType.CONCEPT, `ESN:${id}`, {
        strength: 1.0,
        confidence: 1.0
      });

      // Add configuration links
      Object.entries(config).forEach(([key, value]) => {
        const configNode = this.atomspace.addNode(NodeType.CONCEPT, `${key}:${value}`);
        this.atomspace.addLink(LinkType.EVALUATION, [esnNode, configNode]);
      });

      Logger.info(`ESN atom ${id} created in ${timer.stop()}ms`);
      return esn;
    } catch (error) {
      Logger.error('Failed to create ESN atom:', error);
      throw error;
    }
  }

  async updateESNState(id: string, state: ESNState): Promise<void> {
    try {
      const esnNode = this.atomspace.getAtom(`ESN:${id}`);
      if (!esnNode) throw new Error(`ESN ${id} not found`);

      // Create state node
      const stateNode = this.atomspace.addNode(
        NodeType.CONCEPT,
        `State:${id}:${state.timestamp}`
      );

      // Add state links
      this.atomspace.addLink(LinkType.STATE, [esnNode, stateNode], {
        strength: 1.0,
        confidence: 1.0
      });

      // Store state components
      const components = {
        'reservoir_state': state.state,
        'input_weights': state.weights.input.flat(),
        'reservoir_weights': state.weights.reservoir.flat(),
        'output_weights': state.weights.output.flat()
      };

      Object.entries(components).forEach(([key, value]) => {
        const componentNode = this.atomspace.addNode(
          NodeType.CONCEPT,
          `${key}:${id}:${state.timestamp}`
        );
        this.atomspace.addLink(LinkType.CONTAINS, [stateNode, componentNode]);
      });

      Logger.debug(`Updated state for ESN ${id}`);
    } catch (error) {
      Logger.error('Failed to update ESN state:', error);
      throw error;
    }
  }

  async getESNState(id: string): Promise<ESNState | null> {
    try {
      const esnNode = this.atomspace.getAtom(`ESN:${id}`);
      if (!esnNode) return null;

      // Get latest state link
      const stateLinks = this.atomspace.getIncoming(esnNode)
        .filter(link => link.getType() === LinkType.STATE)
        .sort((a, b) => {
          const timeA = Number(a.getId().split(':')[2]);
          const timeB = Number(b.getId().split(':')[2]);
          return timeB - timeA;
        });

      if (stateLinks.length === 0) return null;

      const latestStateNode = stateLinks[0].getOutgoingSet()[1];
      const componentLinks = this.atomspace.getIncoming(latestStateNode)
        .filter(link => link.getType() === LinkType.CONTAINS);

      // Reconstruct state from components
      const state: Partial<ESNState> = {
        timestamp: Number(latestStateNode.getId().split(':')[2])
      };

      // TODO: Reconstruct full state from components

      return state as ESNState;
    } catch (error) {
      Logger.error('Failed to get ESN state:', error);
      return null;
    }
  }

  getReservoir(id: string): ReservoirAtom | undefined {
    return this.reservoirs.get(id);
  }

  dispose(): void {
    for (const reservoir of this.reservoirs.values()) {
      reservoir.dispose();
    }
    this.reservoirs.clear();
  }
}