import { describe, it, expect } from 'vitest';
import { MemoryPool } from '../../../cogutil/memory/MemoryPool';

describe('MemoryPool', () => {
  it('should create a pool with initial size', () => {
    const pool = new MemoryPool(() => ({}), 5);
    expect(pool.available()).toBe(5);
    expect(pool.inUseCount()).toBe(0);
  });

  it('should acquire and release items', () => {
    const pool = new MemoryPool(() => ({}), 2);
    const item1 = pool.acquire();
    const item2 = pool.acquire();

    expect(pool.available()).toBe(0);
    expect(pool.inUseCount()).toBe(2);

    pool.release(item1);
    expect(pool.available()).toBe(1);
    expect(pool.inUseCount()).toBe(1);
  });

  it('should create new items when pool is empty but not at max size', () => {
    const pool = new MemoryPool(() => ({}), 1, 3);
    const item1 = pool.acquire();
    const item2 = pool.acquire();
    const item3 = pool.acquire();

    expect(pool.size()).toBe(3);
    expect(() => pool.acquire()).toThrow('Memory pool exhausted');
  });

  it('should throw when releasing unmanaged items', () => {
    const pool = new MemoryPool(() => ({}), 1);
    const unmanagedItem = {};
    expect(() => pool.release(unmanagedItem)).toThrow();
  });
});