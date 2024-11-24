import { Logger } from './Logger';

export class Timer {
  private startTime: number;
  private endTime: number | null;

  constructor() {
    this.startTime = performance.now();
    this.endTime = null;
  }

  stop(): number {
    this.endTime = performance.now();
    return this.elapsed();
  }

  elapsed(): number {
    const end = this.endTime || performance.now();
    return end - this.startTime;
  }

  reset(): void {
    this.startTime = performance.now();
    this.endTime = null;
  }

  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async measure<T>(fn: () => Promise<T> | T): Promise<[T, number]> {
    const timer = new Timer();
    try {
      const result = await fn();
      const elapsed = timer.stop();
      Logger.debug(`Operation completed in ${elapsed}ms`);
      return [result, elapsed];
    } catch (error) {
      Logger.error('Operation failed', error);
      throw error;
    }
  }
}