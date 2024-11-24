import { describe, it, expect, vi } from 'vitest';
import { Timer } from '../../cogutil/Timer';

describe('Timer', () => {
  it('should measure elapsed time', async () => {
    const timer = new Timer();
    await Timer.sleep(100);
    const elapsed = timer.stop();
    expect(elapsed).toBeGreaterThanOrEqual(90);
    expect(elapsed).toBeLessThanOrEqual(150);
  });

  it('should reset timer', async () => {
    const timer = new Timer();
    await Timer.sleep(50);
    timer.reset();
    await Timer.sleep(50);
    const elapsed = timer.stop();
    expect(elapsed).toBeGreaterThanOrEqual(40);
    expect(elapsed).toBeLessThanOrEqual(100);
  });

  it('should measure async function execution time', async () => {
    const asyncFn = async () => {
      await Timer.sleep(100);
      return 'result';
    };

    const [result, elapsed] = await Timer.measure(asyncFn);
    expect(result).toBe('result');
    expect(elapsed).toBeGreaterThanOrEqual(90);
    expect(elapsed).toBeLessThanOrEqual(150);
  });
});