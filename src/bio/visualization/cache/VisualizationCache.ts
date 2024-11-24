import { Logger } from '../../../cogutil/Logger';
import { NetworkData } from '../types';

interface CacheEntry {
  data: NetworkData;
  timestamp: number;
  hits: number;
}

export class VisualizationCache {
  private cache: Map<string, CacheEntry>;
  private readonly maxSize: number;
  private readonly ttl: number;

  constructor(maxSize: number = 100, ttl: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: string, data: NetworkData): void {
    try {
      if (this.cache.size >= this.maxSize) {
        this.evictLeastUsed();
      }

      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        hits: 0
      });

      Logger.debug(`Cached visualization data for key: ${key}`);
    } catch (error) {
      Logger.error('Failed to cache visualization data:', error);
      throw error;
    }
  }

  get(key: string): NetworkData | null {
    try {
      const entry = this.cache.get(key);
      if (!entry) return null;

      if (this.isExpired(entry)) {
        this.cache.delete(key);
        return null;
      }

      entry.hits++;
      return entry.data;
    } catch (error) {
      Logger.error('Failed to retrieve cached visualization data:', error);
      return null;
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.ttl;
  }

  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < leastHits) {
        leastHits = entry.hits;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      Logger.debug(`Evicted least used cache entry: ${leastUsedKey}`);
    }
  }

  clear(): void {
    this.cache.clear();
    Logger.info('Visualization cache cleared');
  }

  size(): number {
    return this.cache.size;
  }
}