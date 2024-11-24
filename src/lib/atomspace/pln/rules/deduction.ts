import { Atom, TruthValue } from '../../types/atom';
import { PLNRule } from './pln-rule';

export class DeductionRule implements PLNRule {
  name = 'Deduction';
  description = 'If A implies B and B implies C, then A implies C';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [A, B, C] = atoms;
    if (!A.truthValue || !B.truthValue || !C.truthValue) return [];

    const tv: TruthValue = {
      strength: A.truthValue.strength * B.truthValue.strength,
      confidence: A.truthValue.confidence * B.truthValue.confidence * 0.9
    };

    return [{
      id: `${A.id}->${C.id}`,
      type: 'ImplicationLink',
      name: `Deduction(${A.name},${C.name})`,
      outgoing: [A.id, C.id],
      truthValue: tv
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 3 && 
           atoms.every(atom => atom.truthValue !== undefined);
  }
}