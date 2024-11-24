import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';

export class StimulusCalculator {
  constructor(private config: ECANConfig) {}

  calculateBaseAdjustment(stimulus: number): number {
    return stimulus * this.config.stimulusAmplification;
  }

  calculateContextualAdjustment(baseAdjustment: number, context: Atom): number {
    if (!context.attention) return baseAdjustment;

    // Higher context STI = stronger influence
    const contextInfluence = (context.attention.sti + 100) / 200;
    return baseAdjustment * (0.5 + (contextInfluence * 0.5));
  }
}