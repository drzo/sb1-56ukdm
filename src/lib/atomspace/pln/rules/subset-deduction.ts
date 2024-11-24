import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';
import { calculateDeduction } from '../truth-values/operations';

export class SubsetDeductionRule implements PLNRule {
  name = 'SubsetDeduction';
  description = 'If A is a subset of B and B is a subset of C, then A is a subset of C';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [A, B, C] = atoms;
    if (!A.truthValue || !B.truthValue || !C.truthValue) return [];

    // Calculate deduction with attention-based confidence adjustment
    const baseTv = calculateDeduction(A.truthValue, B.truthValue);
    
    // Adjust confidence based on attention values if available
    const confidenceAdjustment = this.calculateAttentionAdjustment([A, B, C]);
    
    const adjustedTv: TruthValue = {
      strength: baseTv.strength,
      confidence: baseTv.confidence * confidenceAdjustment
    };

    return [{
      id: `${A.id}⊆${C.id}`,
      type: 'SubsetLink',
      name: `Subset(${A.name},${C.name})`,
      outgoing: [A.id, C.id],
      truthValue: adjustedTv,
      attention: this.calculateResultAttention([A, B, C])
    }];
  }

  private calculateAttentionAdjustment(atoms: Atom[]): number {
    const attentionValues = atoms
      .map(atom => atom.attention?.sti ?? 0)
      .map(sti => (sti + 100) / 200); // Normalize to [0,1]

    return attentionValues.reduce((acc, val) => acc * val, 1);
  }

  private calculateResultAttention(atoms: Atom[]): { sti: number; lti: number; vlti: boolean } {
    const avgSti = atoms.reduce((sum, atom) => sum + (atom.attention?.sti ?? 0), 0) / atoms.length;
    const maxLti = Math.max(...atoms.map(atom => atom.attention?.lti ?? 0));
    
    return {
      sti: avgSti,
      lti: maxLti,
      vlti: false
    };
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 3 && 
           atoms.every(atom => atom.truthValue !== undefined);
  }
}