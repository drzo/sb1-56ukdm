import { describe, it, expect } from 'vitest';
import { Random } from '../../cogutil/Random';

describe('Random', () => {
  it('should generate consistent numbers with same seed', () => {
    Random.setSeed(12345);
    const num1 = Random.randint(0, 100);
    Random.setSeed(12345);
    const num2 = Random.randint(0, 100);
    expect(num1).toBe(num2);
  });

  it('should generate integers within specified range', () => {
    const min = 10;
    const max = 20;
    for (let i = 0; i < 100; i++) {
      const num = Random.randint(min, max);
      expect(num).toBeGreaterThanOrEqual(min);
      expect(num).toBeLessThanOrEqual(max);
      expect(Number.isInteger(num)).toBe(true);
    }
  });

  it('should generate floats within specified range', () => {
    const min = 0;
    const max = 1;
    for (let i = 0; i < 100; i++) {
      const num = Random.randfloat(min, max);
      expect(num).toBeGreaterThanOrEqual(min);
      expect(num).toBeLessThanOrEqual(max);
    }
  });

  it('should randomly select items from array', () => {
    const array = [1, 2, 3, 4, 5];
    const selected = Random.randselect(array);
    expect(array).toContain(selected);
  });

  it('should shuffle array maintaining all elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = Random.shuffle([...original]);
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('should generate random booleans with specified probability', () => {
    const trueCount = Array(1000).fill(0)
      .map(() => Random.randomBool(0.7))
      .filter(Boolean).length;
    
    expect(trueCount).toBeGreaterThan(600);
    expect(trueCount).toBeLessThan(800);
  });
});