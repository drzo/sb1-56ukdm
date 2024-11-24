import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from './base-rule';

export abstract class AttentionPLNRule extends BasePLNRule {
  readonly category = 'Attention';

  protected calculateAttentionCorrelation(A: Atom, B: Atom): number {
    if (!A.attention || !B.attention) return 0.5;

    const stiCorrelation = 1 - Math.abs(
      (A.attention.sti - B.attention.sti) / 200
    );
    const ltiCorrelation = 1 - Math.abs(
      (A.attention.lti - B.attention.lti) / 100
    );
    
    return (stiCorrelation * 0.7 + ltiCorrelation * 0.3);
  }

  protected adjustTruthValueByAttention(
    tv: TruthValue,
    correlation: number
  ): TruthValue {
    return {
      strength: tv.strength * (0.8 + 0.2 * correlation),
      confidence: tv.confidence * correlation
    };
  }

  protected validateAttentionRule(atoms: Atom[]): boolean {
    return this.validateAtoms(atoms, 2) && 
           atoms.every(atom => atom.attention !== undefined);
  }
}