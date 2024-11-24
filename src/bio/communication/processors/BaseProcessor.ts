import { Logger } from '../../../cogutil/Logger';
import { SignalProcessingResult } from '../types';

export abstract class BaseProcessor {
  protected id: string;
  protected active: boolean;

  constructor(id: string) {
    this.id = id;
    this.active = false;
  }

  abstract process(input: Float32Array): Promise<SignalProcessingResult>;
  
  isActive(): boolean {
    return this.active;
  }

  async start(): Promise<void> {
    this.active = true;
    Logger.info(`Processor ${this.id} started`);
  }

  async stop(): Promise<void> {
    this.active = false;
    Logger.info(`Processor ${this.id} stopped`);
  }

  protected validateInput(input: Float32Array): boolean {
    if (!input || input.length === 0) {
      Logger.error(`Invalid input for processor ${this.id}`);
      return false;
    }
    return true;
  }
}