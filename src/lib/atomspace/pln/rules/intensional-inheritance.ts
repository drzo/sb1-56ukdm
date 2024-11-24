import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';
import { calculateInduction } from '../truth-values/operations';

export class IntensionalInheritanceRule implements PLNRule {
  name = 'IntensionalInheritance';
  description = 'Derive inheritance relationships based on shared properties and attention values';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue || !A.attention || !B.attention) return [];

    // Consider attention values in the calculation
    const attentionFactor = Math.min(
      A.attention.sti / 100,
      B.attention.sti / 100
    );

    // Calculate base induction strength
    const baseTv = calculateInduction(A.truthValue, B.truthValue);
    
    // Adjust truth value based on attention
    const adjustedTv: TruthValue = {
      strength: baseTv.strength * (0.7 + 0.3 * attentionFactor),
      confidence: baseTv.confidence * attentionFactor
    };
    
    return [{
      id: `${A.id}=>int=>${B.id}`,
      type: 'IntensionalInheritanceLink',
      name: `IntensionalInheritance(${A.name},${B.name})`,
      outgoing: [A.id, B.id],
      truthValue: adjustedTv,
      attention: {
        sti: (A.attention.sti + B.attention.sti) / 2,
        lti: Math.max(A.attention.lti, B.attention.lti),
        vlti: false
      }
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 2 && 
           atoms.every(atom => 
             atom.truthValue !== undefined && 
             atom.attention !== undefined
           );
  }
}