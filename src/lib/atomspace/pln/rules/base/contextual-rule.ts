import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from './base-rule';

export abstract class ContextualPLNRule extends BasePLNRule {
  readonly category = 'Contextual';

  protected adjustForContext(
    truthValue: TruthValue,
    context: Atom,
    atoms: Atom[]
  ): TruthValue {
    if (!context.truthValue) return truthValue;

    const contextualStrength = truthValue.strength * context.truthValue.strength;
    const contextualConfidence = truthValue.confidence * context.truthValue.confidence;
    
    const attentionAdjustment = this.calculateContextualAttentionAdjustment(
      context,
      atoms
    );

    return {
      strength: contextualStrength,
      confidence: contextualConfidence * attentionAdjustment
    };
  }

  private calculateContextualAttentionAdjustment(
    context: Atom,
    atoms: Atom[]
  ): number {
    const attentionValues = [context, ...atoms]
      .map(atom => atom.attention?.sti ?? 0)
      .map(sti => (sti + 100) / 200);

    const contextWeight = attentionValues[0] * 1.5;
    const otherWeights = attentionValues.slice(1);
    
    return (contextWeight + otherWeights.reduce((a, b) => a + b, 0)) / 
           (atoms.length + 0.5);
  }

  protected validateContextualRule(
    atoms: Atom[],
    requiredCount: number
  ): boolean {
    if (!this.validateAtoms(atoms, requiredCount + 1)) return false;
    return atoms[0].attention !== undefined;
  }
}