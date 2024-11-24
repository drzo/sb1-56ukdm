import { ESNState } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export class ESNStateStore {
  private static instance: ESNStateStore;
  private states: Map<string, ESNState>;
  private snapshots: Map<string, ESNState[]>;
  private readonly maxSnapshots = 10;

  private constructor() {
    this.states = new Map();
    this.snapshots = new Map();
  }

  static getInstance(): ESNStateStore {
    if (!ESNStateStore.instance) {
      ESNStateStore.instance = new ESNStateStore();
    }
    return ESNStateStore.instance;
  }

  setState(id: string, state: ESNState): void {
    this.states.set(id, state);
    this.createSnapshot(id, state);
    Logger.debug(`State updated for ESN ${id}`);
  }

  getState(id: string): ESNState | undefined {
    return this.states.get(id);
  }

  private createSnapshot(id: string, state: ESNState): void {
    const snapshots = this.snapshots.get(id) || [];
    snapshots.push({ ...state });
    
    if (snapshots.length > this.maxSnapshots) {
      snapshots.shift();
    }
    
    this.snapshots.set(id, snapshots);
  }

  restoreSnapshot(id: string, index: number = -1): ESNState | undefined {
    const snapshots = this.snapshots.get(id);
    if (!snapshots?.length) return undefined;

    const snapshotIndex = index < 0 ? 
      snapshots.length + index : 
      Math.min(index, snapshots.length - 1);

    const state = snapshots[snapshotIndex];
    if (state) {
      this.states.set(id, { ...state });
      Logger.info(`Restored snapshot ${snapshotIndex} for ESN ${id}`);
    }
    return state;
  }

  clearState(id: string): void {
    this.states.delete(id);
    this.snapshots.delete(id);
  }
}