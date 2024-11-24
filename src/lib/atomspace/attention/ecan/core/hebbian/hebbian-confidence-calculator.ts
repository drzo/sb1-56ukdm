import { Atom } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';

export class HebbianConfidenceCalculator {
  constructor(private config: ECANConfig) {}

  calculateConfidence(
    source: Atom,
    target: Atom,
    existingLink?: Atom
  ): number {
    const baseConfidence = existingLink?.truthValue?.confidence || 0;
    const attentionBonus = this.calculateAttentionBonus(source, target);
    
    return Math.min(1, baseConfidence + 
      (this.config.hebbianLearningRate * attentionBonus));
  }

  private calculateAttentionBonus(source: Atom, target: Atom): number {
    if (!source.attention || !target.attention) return 0;

    const avgSTI = (source.attention.sti + target.attention.sti) / 2;
    const normalizedSTI = (avgSTI + 100) / 200;
    
    return normalizedSTI * 0.5;
  }
}