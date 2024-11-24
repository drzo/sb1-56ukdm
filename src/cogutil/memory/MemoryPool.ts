export class MemoryPool<T> {
  private pool: T[];
  private createFn: () => T;
  private maxSize: number;
  private inUse: Set<T>;

  constructor(createFn: () => T, initialSize: number = 10, maxSize: number = 100) {
    this.createFn = createFn;
    this.maxSize = maxSize;
    this.pool = Array(initialSize).fill(null).map(() => this.createFn());
    this.inUse = new Set();
  }

  acquire(): T {
    let item: T;
    if (this.pool.length > 0) {
      item = this.pool.pop()!;
    } else if (this.size() < this.maxSize) {
      item = this.createFn();
    } else {
      throw new Error('Memory pool exhausted');
    }
    this.inUse.add(item);
    return item;
  }

  release(item: T): void {
    if (!this.inUse.has(item)) {
      throw new Error('Attempting to release an item not from this pool');
    }
    this.inUse.delete(item);
    if (this.pool.length < this.maxSize) {
      this.pool.push(item);
    }
  }

  size(): number {
    return this.pool.length + this.inUse.size;
  }

  available(): number {
    return this.pool.length;
  }

  inUseCount(): number {
    return this.inUse.size;
  }
}