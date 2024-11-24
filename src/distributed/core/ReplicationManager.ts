import { Atom } from '../../types/Atom';
import { AtomSpace } from '../../atomspace/core/AtomSpaceCore';
import { NetworkManager } from '../../network/NetworkManager';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

export class ReplicationManager {
  private atomspace: AtomSpace;
  private networkManager: NetworkManager;
  private replicationFactor: number;
  private replicaMap: Map<string, Set<string>>;

  constructor(atomspace: AtomSpace, replicationFactor: number = 3) {
    this.atomspace = atomspace;
    this.networkManager = NetworkManager.getInstance();
    this.replicationFactor = replicationFactor;
    this.replicaMap = new Map();
  }

  async initialize(): Promise<void> {
    try {
      await this.validateExistingReplicas();
      await this.rebalanceReplicas();
      Logger.info('ReplicationManager initialized');
    } catch (error) {
      Logger.error('Failed to initialize ReplicationManager:', error);
      throw error;
    }
  }

  async replicateAtom(atom: Atom): Promise<void> {
    const timer = new Timer();
    try {
      const nodes = await this.selectReplicationNodes(atom.getId());
      await Promise.all(nodes.map(nodeId => 
        this.networkManager.sendAtomReplica(nodeId, atom)
      ));
      this.replicaMap.set(atom.getId(), new Set(nodes));
      Logger.debug(`Atom ${atom.getId()} replicated in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to replicate atom:', error);
      throw error;
    }
  }

  async removeReplica(atomId: string): Promise<void> {
    try {
      const nodes = this.replicaMap.get(atomId);
      if (nodes) {
        await Promise.all(Array.from(nodes).map(nodeId =>
          this.networkManager.sendRemoveReplica(nodeId, atomId)
        ));
        this.replicaMap.delete(atomId);
      }
    } catch (error) {
      Logger.error('Failed to remove replica:', error);
      throw error;
    }
  }

  private async selectReplicationNodes(atomId: string): Promise<string[]> {
    const availableNodes = await this.networkManager.getAvailableNodes();
    const selectedNodes = new Set<string>();
    
    while (selectedNodes.size < this.replicationFactor && 
           selectedNodes.size < availableNodes.length) {
      const index = Math.floor(Math.random() * availableNodes.length);
      selectedNodes.add(availableNodes[index]);
    }

    return Array.from(selectedNodes);
  }

  private async validateExistingReplicas(): Promise<void> {
    const timer = new Timer();
    try {
      for (const [atomId, nodes] of this.replicaMap.entries()) {
        const validNodes = await Promise.all(
          Array.from(nodes).map(async nodeId => {
            const isValid = await this.networkManager.checkNodeHealth(nodeId);
            return isValid ? nodeId : null;
          })
        );
        
        const newNodes = validNodes.filter((nodeId): nodeId is string => nodeId !== null);
        if (newNodes.length < this.replicationFactor) {
          await this.rebalanceAtomReplicas(atomId, new Set(newNodes));
        }
      }
      Logger.debug(`Replica validation completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to validate replicas:', error);
      throw error;
    }
  }

  private async rebalanceAtomReplicas(
    atomId: string,
    currentNodes: Set<string>
  ): Promise<void> {
    try {
      const neededReplicas = this.replicationFactor - currentNodes.size;
      if (neededReplicas <= 0) return;

      const availableNodes = await this.networkManager.getAvailableNodes();
      const newNodes = availableNodes
        .filter(nodeId => !currentNodes.has(nodeId))
        .slice(0, neededReplicas);

      const atom = this.atomspace.getAtom(atomId);
      if (atom) {
        await Promise.all(newNodes.map(nodeId =>
          this.networkManager.sendAtomReplica(nodeId, atom)
        ));
        newNodes.forEach(nodeId => currentNodes.add(nodeId));
        this.replicaMap.set(atomId, currentNodes);
      }
    } catch (error) {
      Logger.error('Failed to rebalance atom replicas:', error);
      throw error;
    }
  }

  private async rebalanceReplicas(): Promise<void> {
    const timer = new Timer();
    try {
      const atoms = this.atomspace.getAllAtoms();
      await Promise.all(atoms.map(atom => {
        const nodes = this.replicaMap.get(atom.getId()) || new Set();
        return this.rebalanceAtomReplicas(atom.getId(), nodes);
      }));
      Logger.debug(`Replica rebalancing completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to rebalance replicas:', error);
      throw error;
    }
  }

  async getReplicationFactor(): Promise<number> {
    return this.replicationFactor;
  }

  async shutdown(): Promise<void> {
    // Cleanup code here
    this.replicaMap.clear();
  }
}