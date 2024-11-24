import { Logger } from '../cogutil/Logger';
import { Timer } from '../cogutil/Timer';
import { AtomSpaceProvider } from '../atomspace/core/AtomSpaceProvider';
import { Atom } from '../types/Atom';
import { io, Socket } from 'socket.io-client';

interface NetworkMessage {
  type: 'atom' | 'query' | 'sync' | 'heartbeat';
  data: any;
  timestamp: number;
  sender: string;
}

export class NetworkManager {
  private static instance: NetworkManager;
  private socket: Socket | null = null;
  private atomspace = AtomSpaceProvider.getInstance().getAtomSpace();
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    Logger.info('NetworkManager initialized');
  }

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  startServer(port: number = 8080): void {
    try {
      this.socket = io(`http://localhost:${port}`);
      this.setupSocketHandlers();
      this.startSyncInterval();
      Logger.info(`Network manager started on port ${port}`);
    } catch (error) {
      Logger.error('Failed to start network manager:', error);
      throw error;
    }
  }

  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      Logger.info('Connected to server');
    });

    this.socket.on('disconnect', () => {
      Logger.info('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      Logger.error('Socket error:', error);
    });
  }

  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.broadcastSync();
    }, 30000); // Sync every 30 seconds
  }

  private async broadcastSync(): Promise<void> {
    const atoms = await this.atomspace.getAllAtoms();
    const atomIds = atoms.map(atom => atom.getId());

    if (this.socket?.connected) {
      this.socket.emit('sync', {
        type: 'sync',
        data: { atomIds },
        timestamp: Date.now(),
        sender: 'client'
      });
    }
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    Logger.info('NetworkManager stopped');
  }
}