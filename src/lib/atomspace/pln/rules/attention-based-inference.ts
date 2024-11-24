import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';
import { calculateRevision } from '../truth-values/operations';

export class AttentionBasedInferenceRule implements PLNRule {
  name = 'AttentionBasedInference';
  description = 'Derive new relationships based on attention allocation patterns';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [A, B] = atoms;
    if (!A.attention || !B.attention || !A.truthValue || !B.truthValue) return [];

    // Calculate correlation based on attention patterns
    const attentionCorrelation = this.calculateAttentionCorrelation(A, B);
    
    // Combine with truth values
    const combinedTv: TruthValue = {
      strength: (A.truthValue.strength + B.truthValue.strength) * 
                attentionCorrelation / 2,
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence) * 
                 attentionCorrelation
    };

    return [{
      id: `${A.id}-att-${B.id}`,
      type: 'AttentionalRelationshipLink',
      name: `AttentionalRelationship(${A.name},${B.name})`,
      outgoing: [A.id, B.id],
      truthValue: combinedTv,
      attention: {
        sti: (A.attention.sti + B.attention.sti) / 2,
        lti: Math.max(A.attention.lti, B.attention.lti),
        vlti: false
      }
    }];
  }

  private calculateAttentionCorrelation(A: Atom, B: Atom): number {
    const stiCorrelation = 1 - Math.abs(
      (A.attention!.sti - B.attention!.sti) / 200
    );
    const ltiCorrelation = 1 - Math.abs(
      (A.attention!.lti - B.attention!.lti) / 100
    );
    
    return (stiCorrelation * 0.7 + ltiCorrelation * 0.3);
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 2 && 
           atoms.every(atom => 
             atom.attention !== undefined &&
             atom.truthValue !== undefined
           );
  }
}