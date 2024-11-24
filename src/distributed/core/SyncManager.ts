import { Atom } from '../../types/Atom';
import { AtomSpace } from '../../atomspace/core/AtomSpaceCore';
import { NetworkManager } from '../../network/NetworkManager';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

interface SyncUpdate {
  atomId: string;
  timestamp: number;
  operation: 'add' | 'remove' | 'update';
  data?: any;
}

export class SyncManager {
  private atomspace: AtomSpace;
  private networkManager: NetworkManager;
  private updateLog: SyncUpdate[];
  private lastSyncTime: number;
  private syncInterval: NodeJS.Timeout | null;
  private readonly syncIntervalMs = 5000;

  constructor(atomspace: AtomSpace) {
    this.atomspace = atomspace;
    this.networkManager = NetworkManager.getInstance();
    this.updateLog = [];
    this.lastSyncTime = Date.now();
    this.syncInterval = null;
  }

  async initialize(): Promise<void> {
    try {
      await this.performInitialSync();
      this.startPeriodicSync();
      Logger.info('SyncManager initialized');
    } catch (error) {
      Logger.error('Failed to initialize SyncManager:', error);
      throw error;
    }
  }

  private async performInitialSync(): Promise<void> {
    const timer = new Timer();
    try {
      const nodes = await this.networkManager.getAvailableNodes();
      const syncPromises = nodes.map(nodeId => 
        this.requestSyncFromNode(nodeId)
      );
      await Promise.all(syncPromises);
      Logger.debug(`Initial sync completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to perform initial sync:', error);
      throw error;
    }
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(
      () => this.performPeriodicSync(),
      this.syncIntervalMs
    );
  }

  private async performPeriodicSync(): Promise<void> {
    try {
      const nodes = await this.networkManager.getAvailableNodes();
      await Promise.all(nodes.map(nodeId => 
        this.syncWithNode(nodeId)
      ));
    } catch (error) {
      Logger.error('Failed to perform periodic sync:', error);
    }
  }

  async broadcastUpdate(atom: Atom): Promise<void> {
    const timer = new Timer();
    try {
      const update: SyncUpdate = {
        atomId: atom.getId(),
        timestamp: Date.now(),
        operation: 'update',
        data: atom
      };
      this.updateLog.push(update);
      await this.networkManager.broadcastAtomUpdate(update);
      Logger.debug(`Update broadcast completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to broadcast update:', error);
      throw error;
    }
  }

  async broadcastRemoval(atomId: string): Promise<void> {
    try {
      const update: SyncUpdate = {
        atomId,
        timestamp: Date.now(),
        operation: 'remove'
      };
      this.updateLog.push(update);
      await this.networkManager.broadcastAtomRemoval(update);
    } catch (error) {
      Logger.error('Failed to broadcast removal:', error);
      throw error;
    }
  }

  async getUpdatesSince(timestamp: number): Promise<SyncUpdate[]> {
    return this.updateLog.filter(update => update.timestamp > timestamp);
  }

  private async requestSyncFromNode(nodeId: string): Promise<void> {
    try {
      const updates = await this.networkManager.requestSync(
        nodeId,
        this.lastSyncTime
      );
      await this.processSyncUpdates(updates);
    } catch (error) {
      Logger.error(`Failed to sync with node ${nodeId}:`, error);
    }
  }

  private async syncWithNode(nodeId: string): Promise<void> {
    const timer = new Timer();
    try {
      const localUpdates = await this.getUpdatesSince(this.lastSyncTime);
      const remoteUpdates = await this.networkManager.exchangeUpdates(
        nodeId,
        localUpdates
      );
      await this.processSyncUpdates(remoteUpdates);
      Logger.debug(`Sync with node ${nodeId} completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error(`Failed to sync with node ${nodeId}:`, error);
    }
  }

  private async processSyncUpdates(updates: SyncUpdate[]): Promise<void> {
    for (const update of updates) {
      try {
        switch (update.operation) {
          case 'add':
          case 'update':
            if (update.data) {
              await this.atomspace.addAtom(update.data);
            }
            break;
          case 'remove':
            await this.atomspace.removeAtom(update.atomId);
            break;
        }
      } catch (error) {
        Logger.error(`Failed to process update for atom ${update.atomId}:`, error);
      }
    }
  }

  async requestAtomSync(atomId: string): Promise<Atom | null> {
    try {
      const nodes = await this.networkManager.getAvailableNodes();
      for (const nodeId of nodes) {
        const atom = await this.networkManager.requestAtom(nodeId, atomId);
        if (atom) {
          return atom;
        }
      }
      return null;
    } catch (error) {
      Logger.error(`Failed to sync atom ${atomId}:`, error);
      return null;
    }
  }

  async getAverageSyncLatency(): Promise<number> {
    // Implementation to calculate average sync latency
    return 0;
  }

  async shutdown(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.updateLog = [];
  }
}