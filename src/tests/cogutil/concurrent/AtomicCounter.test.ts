import { describe, it, expect } from 'vitest';
import { AtomicCounter } from '../../../cogutil/concurrent/AtomicCounter';

describe('AtomicCounter', () => {
  it('should initialize with default value', () => {
    const counter = new AtomicCounter();
    expect(counter.get()).toBe(0);
  });

  it('should initialize with custom value', () => {
    const counter = new AtomicCounter(10);
    expect(counter.get()).toBe(10);
  });

  it('should increment and decrement', () => {
    const counter = new AtomicCounter();
    expect(counter.increment()).toBe(1);
    expect(counter.increment()).toBe(2);
    expect(counter.decrement()).toBe(1);
  });

  it('should add and subtract values', () => {
    const counter = new AtomicCounter(10);
    expect(counter.add(5)).toBe(15);
    expect(counter.subtract(3)).toBe(12);
  });

  it('should compare and set values', () => {
    const counter = new AtomicCounter(5);
    expect(counter.compareAndSet(5, 10)).toBe(true);
    expect(counter.get()).toBe(10);
    expect(counter.compareAndSet(5, 15)).toBe(false);
    expect(counter.get()).toBe(10);
  });
});