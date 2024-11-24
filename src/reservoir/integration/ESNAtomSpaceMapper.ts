import { ESNState, ESNConfig } from '../types/ESNTypes';
import { ESNAtomType, ESNLinkType } from '../types/AtomSpaceTypes';
import { Atom } from '../../types/Atom';
import { Logger } from '../../cogutil/Logger';

export class ESNAtomSpaceMapper {
  static stateToAtoms(state: ESNState, id: string): {
    nodes: Array<{type: ESNAtomType; name: string; value?: number[]}>;
    links: Array<{type: ESNLinkType; source: string; target: string}>;
  } {
    try {
      const nodes = [
        {
          type: ESNAtomType.STATE,
          name: `State:${id}:${state.timestamp}`,
          value: state.state
        },
        {
          type: ESNAtomType.WEIGHT,
          name: `InputWeights:${id}`,
          value: state.weights.input.flat()
        },
        {
          type: ESNAtomType.WEIGHT,
          name: `ReservoirWeights:${id}`,
          value: state.weights.reservoir.flat()
        }
      ];

      const links = [
        {
          type: ESNLinkType.HAS_STATE,
          source: `ESN:${id}`,
          target: `State:${id}:${state.timestamp}`
        },
        {
          type: ESNLinkType.HAS_WEIGHT,
          source: `ESN:${id}`,
          target: `InputWeights:${id}`
        },
        {
          type: ESNLinkType.HAS_WEIGHT,
          source: `ESN:${id}`,
          target: `ReservoirWeights:${id}`
        }
      ];

      return { nodes, links };
    } catch (error) {
      Logger.error('Failed to map ESN state to atoms:', error);
      throw error;
    }
  }

  static atomsToState(atoms: Atom[]): ESNState | null {
    try {
      // TODO: Implement conversion from atoms to ESN state
      return null;
    } catch (error) {
      Logger.error('Failed to map atoms to ESN state:', error);
      return null;
    }
  }

  static configToAtoms(config: ESNConfig, id: string): {
    nodes: Array<{type: ESNAtomType; name: string; value?: number}>;
    links: Array<{type: ESNLinkType; source: string; target: string}>;
  } {
    try {
      const nodes = Object.entries(config).map(([key, value]) => ({
        type: ESNAtomType.CONFIG,
        name: `Config:${id}:${key}`,
        value: value as number
      }));

      const links = nodes.map(node => ({
        type: ESNLinkType.HAS_CONFIG,
        source: `ESN:${id}`,
        target: node.name
      }));

      return { nodes, links };
    } catch (error) {
      Logger.error('Failed to map ESN config to atoms:', error);
      throw error;
    }
  }
}