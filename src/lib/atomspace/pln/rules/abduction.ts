import { Atom, TruthValue } from '../../types/atom';
import { PLNRule } from './pln-rule';

export class AbductionRule implements PLNRule {
  name = 'Abduction';
  description = 'Infer possible explanations through backward reasoning';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [A, B, C] = atoms;
    if (!A.truthValue || !B.truthValue || !C.truthValue) return [];

    const tv: TruthValue = {
      strength: Math.sqrt(A.truthValue.strength * C.truthValue.strength),
      confidence: A.truthValue.confidence * C.truthValue.confidence * 0.7
    };

    return [{
      id: `${A.id}⊢${C.id}`,
      type: 'ImplicationLink',
      name: `Abduction(${A.name},${C.name})`,
      outgoing: [A.id, C.id],
      truthValue: tv
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 3 && 
           atoms.every(atom => atom.truthValue !== undefined);
  }
}