import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';
import { calculateRevision } from '../truth-values/operations';

export class HebbianRule implements PLNRule {
  name = 'Hebbian';
  description = 'Update truth values based on co-occurrence and attention';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue || !A.attention || !B.attention) return [];

    // Calculate co-activation strength based on attention values
    const coActivation = Math.min(A.attention.sti, B.attention.sti) / 100;
    
    // Create new truth value incorporating co-activation
    const hebbianTv: TruthValue = {
      strength: (A.truthValue.strength + B.truthValue.strength + coActivation) / 3,
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence) * 0.9
    };

    return [{
      id: `${A.id}-heb-${B.id}`,
      type: 'HebbianLink',
      name: `Hebbian(${A.name},${B.name})`,
      outgoing: [A.id, B.id],
      truthValue: hebbianTv,
      attention: {
        sti: (A.attention.sti + B.attention.sti) / 2,
        lti: Math.max(A.attention.lti, B.attention.lti),
        vlti: A.attention.vlti || B.attention.vlti
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