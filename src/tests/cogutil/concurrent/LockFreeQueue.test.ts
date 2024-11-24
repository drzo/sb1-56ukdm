import { describe, it, expect } from 'vitest';
import { LockFreeQueue } from '../../../cogutil/concurrent/LockFreeQueue';

describe('LockFreeQueue', () => {
  it('should enqueue and dequeue items', () => {
    const queue = new LockFreeQueue<number>(3);
    expect(queue.enqueue(1)).toBe(true);
    expect(queue.enqueue(2)).toBe(true);
    expect(queue.size()).toBe(2);

    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should handle queue full condition', () => {
    const queue = new LockFreeQueue<number>(2);
    expect(queue.enqueue(1)).toBe(true);
    expect(queue.enqueue(2)).toBe(false);
    expect(queue.isFull()).toBe(true);
  });

  it('should peek without removing items', () => {
    const queue = new LockFreeQueue<number>(3);
    queue.enqueue(1);
    queue.enqueue(2);

    expect(queue.peek()).toBe(1);
    expect(queue.size()).toBe(2);
  });

  it('should clear the queue', () => {
    const queue = new LockFreeQueue<number>(3);
    queue.enqueue(1);
    queue.enqueue(2);
    queue.clear();

    expect(queue.isEmpty()).toBe(true);
    expect(queue.size()).toBe(0);
  });
});