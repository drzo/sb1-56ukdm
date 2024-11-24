import { ESNState } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';
import { get, set } from 'idb-keyval';

export class ESNStateCache {
  private static readonly CACHE_PREFIX = 'esn-state-';
  private static readonly CHECKPOINT_PREFIX = 'esn-checkpoint-';
  private static readonly MAX_CACHE_SIZE = 100;

  async cacheState(id: string, state: ESNState): Promise<void> {
    try {
      const key = this.getCacheKey(id);
      await set(key, state);
      await this.pruneCache();
    } catch (error) {
      Logger.error('Failed to cache state:', error);
      throw error;
    }
  }

  async retrieveState(id: string): Promise<ESNState | null> {
    try {
      const key = this.getCacheKey(id);
      return await get(key);
    } catch (error) {
      Logger.error('Failed to retrieve state:', error);
      return null;
    }
  }

  async createCheckpoint(id: string, state: ESNState): Promise<void> {
    try {
      const key = this.getCheckpointKey(id);
      await set(key, {
        state,
        timestamp: Date.now()
      });
    } catch (error) {
      Logger.error('Failed to create checkpoint:', error);
      throw error;
    }
  }

  async loadCheckpoint(id: string): Promise<ESNState | null> {
    try {
      const key = this.getCheckpointKey(id);
      const checkpoint = await get(key);
      return checkpoint?.state || null;
    } catch (error) {
      Logger.error('Failed to load checkpoint:', error);
      return null;
    }
  }

  private getCacheKey(id: string): string {
    return `${ESNStateCache.CACHE_PREFIX}${id}`;
  }

  private getCheckpointKey(id: string): string {
    return `${ESNStateCache.CHECKPOINT_PREFIX}${id}`;
  }

  private async pruneCache(): Promise<void> {
    try {
      const keys = await this.getAllCacheKeys();
      if (keys.length > ESNStateCache.MAX_CACHE_SIZE) {
        const keysToRemove = keys
          .slice(0, keys.length - ESNStateCache.MAX_CACHE_SIZE);
        await Promise.all(keysToRemove.map(key => this.invalidateCache(key)));
      }
    } catch (error) {
      Logger.error('Failed to prune cache:', error);
    }
  }

  private async getAllCacheKeys(): Promise<string[]> {
    // Implementation depends on your storage mechanism
    return [];
  }

  private async invalidateCache(key: string): Promise<void> {
    try {
      await set(key, null);
    } catch (error) {
      Logger.error(`Failed to invalidate cache for key ${key}:`, error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await this.getAllCacheKeys();
      await Promise.all(keys.map(key => this.invalidateCache(key)));
      Logger.info('Cache cleared');
    } catch (error) {
      Logger.error('Failed to clear cache:', error);
      throw error;
    }
  }
}