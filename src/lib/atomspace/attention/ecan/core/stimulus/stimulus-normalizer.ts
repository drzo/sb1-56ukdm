import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';

export class StimulusNormalizer {
  constructor(private config: ECANConfig) {}

  updateAttentionValues(atom: Atom, adjustment: number): Atom {
    if (!atom.attention) throw new Error('Atom must have attention value');

    const newSTI = this.normalizeSTI(atom.attention.sti + adjustment);
    const newLTI = this.updateLTI(atom.attention.lti, Math.abs(adjustment));

    return {
      ...atom,
      attention: {
        sti: newSTI,
        lti: newLTI,
        vlti: this.shouldBeVLTI(newLTI, newSTI)
      }
    };
  }

  private normalizeSTI(sti: number): number {
    return Math.max(this.config.minSTI, Math.min(this.config.maxSTI, sti));
  }

  private updateLTI(currentLTI: number, adjustment: number): number {
    const ltiIncrement = adjustment > 10 ? 1 : 0;
    return Math.min(this.config.maxLTI, currentLTI + ltiIncrement);
  }

  private shouldBeVLTI(lti: number, sti: number): boolean {
    return lti > this.config.maxLTI * 0.8 || sti > this.config.maxSTI * 0.9;
  }
}