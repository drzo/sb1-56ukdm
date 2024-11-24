import { AtomSpace } from '../../atomspace/core/AtomSpaceCore';
import { Atom } from '../../types/Atom';
import { Node } from '../../types/Node';
import { Link } from '../../types/Link';
import { NodeType, LinkType } from '../../types/AtomTypes';
import { ReplicationManager } from './ReplicationManager';
import { SyncManager } from './SyncManager';
import { ConsistencyManager } from './ConsistencyManager';
import { NetworkManager } from '../../network/NetworkManager';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

export class DistributedAtomSpace extends AtomSpace {
  private replicationManager: ReplicationManager;
  private syncManager: SyncManager;
  private consistencyManager: ConsistencyManager;
  private networkManager: NetworkManager;
  private nodeId: string;

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;
    this.replicationManager = new ReplicationManager(this);
    this.syncManager = new SyncManager(this);
    this.consistencyManager = new ConsistencyManager(this);
    this.networkManager = NetworkManager.getInstance();
    this.initializeDistributedSystem();
    Logger.info(`DistributedAtomSpace initialized for node ${nodeId}`);
  }

  private async initializeDistributedSystem(): Promise<void> {
    try {
      await this.networkManager.startServer();
      await this.syncManager.initialize();
      await this.replicationManager.initialize();
      await this.consistencyManager.initialize();
      this.setupEventHandlers();
    } catch (error) {
      Logger.error('Failed to initialize distributed system:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    this.networkManager.on('atomUpdate', this.handleAtomUpdate.bind(this));
    this.networkManager.on('syncRequest', this.handleSyncRequest.bind(this));
    this.networkManager.on('consistencyCheck', this.handleConsistencyCheck.bind(this));
  }

  async addNode(type: NodeType, name: string, tv?: TruthValue): Promise<Node> {
    const timer = new Timer();
    try {
      const node = await super.addNode(type, name, tv);
      await this.replicationManager.replicateAtom(node);
      await this.syncManager.broadcastUpdate(node);
      Logger.debug(`Node added and replicated in ${timer.stop()}ms`);
      return node;
    } catch (error) {
      Logger.error('Failed to add node:', error);
      throw error;
    }
  }

  async addLink(type: LinkType, outgoing: Atom[], tv?: TruthValue): Promise<Link> {
    const timer = new Timer();
    try {
      const link = await super.addLink(type, outgoing, tv);
      await this.replicationManager.replicateAtom(link);
      await this.syncManager.broadcastUpdate(link);
      Logger.debug(`Link added and replicated in ${timer.stop()}ms`);
      return link;
    } catch (error) {
      Logger.error('Failed to add link:', error);
      throw error;
    }
  }

  async removeAtom(id: string): Promise<boolean> {
    const timer = new Timer();
    try {
      const removed = await super.removeAtom(id);
      if (removed) {
        await this.replicationManager.removeReplica(id);
        await this.syncManager.broadcastRemoval(id);
      }
      Logger.debug(`Atom removal processed in ${timer.stop()}ms`);
      return removed;
    } catch (error) {
      Logger.error('Failed to remove atom:', error);
      throw error;
    }
  }

  private async handleAtomUpdate(update: any): Promise<void> {
    try {
      const { atom, sourceNodeId } = update;
      if (sourceNodeId !== this.nodeId) {
        await this.consistencyManager.validateUpdate(atom);
        await super.addAtom(atom);
        Logger.debug(`Received atom update from node ${sourceNodeId}`);
      }
    } catch (error) {
      Logger.error('Failed to handle atom update:', error);
    }
  }

  private async handleSyncRequest(request: any): Promise<void> {
    try {
      const { requestingNodeId, lastSyncTimestamp } = request;
      const updates = await this.syncManager.getUpdatesSince(lastSyncTimestamp);
      await this.networkManager.sendSyncResponse(requestingNodeId, updates);
      Logger.debug(`Processed sync request from node ${requestingNodeId}`);
    } catch (error) {
      Logger.error('Failed to handle sync request:', error);
    }
  }

  private async handleConsistencyCheck(check: any): Promise<void> {
    try {
      const { atomId, hash } = check;
      const isConsistent = await this.consistencyManager.checkConsistency(atomId, hash);
      if (!isConsistent) {
        await this.requestAtomSync(atomId);
      }
    } catch (error) {
      Logger.error('Failed to handle consistency check:', error);
    }
  }

  private async requestAtomSync(atomId: string): Promise<void> {
    try {
      const atom = await this.syncManager.requestAtomSync(atomId);
      if (atom) {
        await super.addAtom(atom);
        Logger.debug(`Synced atom ${atomId}`);
      }
    } catch (error) {
      Logger.error('Failed to request atom sync:', error);
    }
  }

  async getDistributedStats(): Promise<{
    nodeCount: number;
    replicationFactor: number;
    syncLatency: number;
    consistencyScore: number;
  }> {
    return {
      nodeCount: await this.networkManager.getNodeCount(),
      replicationFactor: await this.replicationManager.getReplicationFactor(),
      syncLatency: await this.syncManager.getAverageSyncLatency(),
      consistencyScore: await this.consistencyManager.getConsistencyScore()
    };
  }

  async shutdown(): Promise<void> {
    try {
      await this.syncManager.shutdown();
      await this.replicationManager.shutdown();
      await this.consistencyManager.shutdown();
      await this.networkManager.stop();
      Logger.info('DistributedAtomSpace shut down successfully');
    } catch (error) {
      Logger.error('Error during shutdown:', error);
      throw error;
    }
  }
}