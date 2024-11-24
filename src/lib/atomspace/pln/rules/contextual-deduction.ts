import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';
import { calculateDeduction } from '../truth-values/operations';

export class ContextualDeductionRule implements PLNRule {
  name = 'ContextualDeduction';
  description = 'Apply deduction while considering context and attention values';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [context, A, B, C] = atoms;
    if (!context.truthValue || !A.truthValue || !B.truthValue || !C.truthValue) return [];

    // Calculate base deduction
    const baseTv = calculateDeduction(A.truthValue, B.truthValue);
    
    // Adjust strength and confidence based on context
    const contextualTv: TruthValue = {
      strength: baseTv.strength * context.truthValue.strength,
      confidence: baseTv.confidence * context.truthValue.confidence
    };

    // Further adjust based on attention values if available
    const attentionAdjustment = this.calculateAttentionAdjustment([context, A, B, C]);
    
    const finalTv: TruthValue = {
      strength: contextualTv.strength,
      confidence: contextualTv.confidence * attentionAdjustment
    };

    return [{
      id: `${context.id}:${A.id}->${C.id}`,
      type: 'ContextualImplicationLink',
      name: `ContextualDeduction(${context.name},${A.name},${C.name})`,
      outgoing: [context.id, A.id, C.id],
      truthValue: finalTv,
      attention: this.calculateResultAttention([context, A, B, C])
    }];
  }

  private calculateAttentionAdjustment(atoms: Atom[]): number {
    const attentionValues = atoms
      .map(atom => atom.attention?.sti ?? 0)
      .map(sti => (sti + 100) / 200); // Normalize to [0,1]

    // Weight context's attention more heavily
    const contextWeight = attentionValues[0] * 1.5;
    const otherWeights = attentionValues.slice(1);
    
    return (contextWeight + otherWeights.reduce((a, b) => a + b, 0)) / (atoms.length + 0.5);
  }

  private calculateResultAttention(atoms: Atom[]): { sti: number; lti: number; vlti: boolean } {
    // Weight context's attention more heavily in the calculation
    const contextSti = atoms[0].attention?.sti ?? 0;
    const otherSti = atoms.slice(1).reduce((sum, atom) => sum + (atom.attention?.sti ?? 0), 0);
    
    const avgSti = (contextSti * 1.5 + otherSti) / (atoms.length + 0.5);
    const maxLti = Math.max(...atoms.map(atom => atom.attention?.lti ?? 0));
    
    return {
      sti: avgSti,
      lti: maxLti,
      vlti: false
    };
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 4 && 
           atoms.every(atom => atom.truthValue !== undefined);
  }
}