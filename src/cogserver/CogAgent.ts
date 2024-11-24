import { Logger } from '../cogutil/Logger';
import { Timer } from '../cogutil/Timer';
import { AtomSpaceProvider } from '../atomspace/core/AtomSpaceProvider';

export abstract class CogAgent {
  protected id: string;
  protected priority: number;
  protected atomspace = AtomSpaceProvider.getInstance().getAtomSpace();
  private lastRunTime: number = 0;
  private runCount: number = 0;

  constructor(id: string, priority: number = 0) {
    this.id = id;
    this.priority = priority;
  }

  public getId(): string {
    return this.id;
  }

  public getPriority(): number {
    return this.priority;
  }

  public async run(): Promise<void> {
    const timer = new Timer();
    
    try {
      await this.runOnce();
      this.runCount++;
      this.lastRunTime = timer.stop();
      
      Logger.debug(`Agent ${this.id} completed run #${this.runCount} in ${this.lastRunTime}ms`);
    } catch (error) {
      Logger.error(`Agent ${this.id} failed:`, error);
      throw error;
    }
  }

  protected abstract runOnce(): Promise<void>;

  public getStats(): {
    runCount: number;
    lastRunTime: number;
    averageRunTime: number;
  } {
    return {
      runCount: this.runCount,
      lastRunTime: this.lastRunTime,
      averageRunTime: this.lastRunTime / Math.max(1, this.runCount)
    };
  }
}