import { Logger } from '../cogutil/Logger';

export abstract class CogModule {
  protected id: string;
  protected enabled: boolean;
  protected priority: number;

  constructor(id: string, priority: number = 0) {
    this.id = id;
    this.enabled = false;
    this.priority = priority;
  }

  public getId(): string {
    return this.id;
  }

  public getPriority(): number {
    return this.priority;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public enable(): void {
    if (!this.enabled) {
      this.enabled = true;
      Logger.info(`Module ${this.id} enabled`);
    }
  }

  public disable(): void {
    if (this.enabled) {
      this.enabled = false;
      Logger.info(`Module ${this.id} disabled`);
    }
  }

  public abstract run(): Promise<void>;
  
  public abstract cleanup(): void;
}