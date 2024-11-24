export class WeakRefCache<K, V extends object> {
  private cache: Map<K, WeakRef<V>>;
  private cleanupInterval: number;
  private intervalId: NodeJS.Timeout | null;

  constructor(cleanupIntervalMs: number = 60000) {
    this.cache = new Map();
    this.cleanupInterval = cleanupIntervalMs;
    this.intervalId = null;
    this.startCleanup();
  }

  set(key: K, value: V): void {
    this.cache.set(key, new WeakRef(value));
  }

  get(key: K): V | undefined {
    const ref = this.cache.get(key);
    if (!ref) return undefined;

    const value = ref.deref();
    if (!value) {
      this.cache.delete(key);
      return undefined;
    }

    return value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    let count = 0;
    for (const [key] of this.cache) {
      if (this.get(key) !== undefined) {
        count++;
      }
    }
    return count;
  }

  private cleanup(): void {
    for (const [key] of this.cache) {
      this.get(key); // This will remove any dead references
    }
  }

  private startCleanup(): void {
    this.intervalId = setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  dispose(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.clear();
  }
}