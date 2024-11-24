import { ECANConfig } from '../config/ecan-config';

export class AttentionUtils {
  constructor(private config: ECANConfig) {}

  normalizeSTI(sti: number): number {
    return Math.max(
      this.config.minSTI,
      Math.min(this.config.maxSTI, sti)
    );
  }

  updateSTI(currentSTI: number, delta: number): number {
    const newSTI = currentSTI + delta;
    return this.normalizeSTI(newSTI);
  }

  calculateImportanceSpread(sti: number): number {
    const normalizedSTI = (sti - this.config.minSTI) / 
                         (this.config.maxSTI - this.config.minSTI);
    return normalizedSTI * this.config.spreadingFactor;
  }

  calculateDecayFactor(timeElapsed: number): number {
    return Math.exp(-this.config.attentionDecayRate * timeElapsed);
  }
}