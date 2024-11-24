import { describe, it, expect } from 'vitest';
import { Statistics } from '../../cogutil/Statistics';

describe('Statistics', () => {
  it('should calculate mean correctly', () => {
    expect(Statistics.mean([1, 2, 3, 4, 5])).toBe(3);
    expect(Statistics.mean([])).toBe(0);
  });

  it('should calculate variance correctly', () => {
    expect(Statistics.variance([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(4.571, 3);
    expect(Statistics.variance([1])).toBe(0);
  });

  it('should calculate standard deviation correctly', () => {
    expect(Statistics.standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });

  it('should calculate correlation correctly', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    expect(Statistics.correlation(x, y)).toBe(1);
  });

  it('should calculate entropy correctly', () => {
    const probabilities = [0.5, 0.25, 0.25];
    expect(Statistics.entropy(probabilities)).toBeCloseTo(1.5, 3);
  });

  it('should calculate KL divergence correctly', () => {
    const p = [0.5, 0.5];
    const q = [0.25, 0.75];
    expect(Statistics.kld(p, q)).toBeCloseTo(0.207, 3);
  });

  it('should calculate combinations correctly', () => {
    expect(Statistics.combinations(5, 2)).toBe(10);
    expect(Statistics.combinations(10, 3)).toBe(120);
  });
});