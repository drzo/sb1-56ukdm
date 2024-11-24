import { Atom, AttentionValue } from '../../../../types';
import { ECANConfig } from '../../config/ecan-config';

export class HebbianAttentionCalculator {
  constructor(private config: ECANConfig) {}

  calculateAttention(source: Atom, target: Atom): AttentionValue {
    if (!source.attention || !target.attention) {
      throw new Error('Both atoms must have attention values');
    }

    return {
      sti: this.calculateSTI(source.attention.sti, target.attention.sti),
      lti: this.calculateLTI(source.attention.lti, target.attention.lti),
      vlti: this.calculateVLTI(source.attention, target.attention)
    };
  }

  private calculateSTI(sourceSTI: number, targetSTI: number): number {
    return (sourceSTI + targetSTI) / 2;
  }

  private calculateLTI(sourceLTI: number, targetLTI: number): number {
    return Math.max(sourceLTI, targetLTI);
  }

  private calculateVLTI(
    sourceAV: AttentionValue,
    targetAV: AttentionValue
  ): boolean {
    return sourceAV.vlti || targetAV.vlti;
  }
}