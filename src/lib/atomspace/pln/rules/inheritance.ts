import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';
import { calculateInduction } from '../truth-values/operations';

export class InheritanceRule implements PLNRule {
  name = 'Inheritance';
  description = 'Derive inheritance relationships based on shared properties';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    const tv = calculateInduction(A.truthValue, B.truthValue);
    
    return [{
      id: `${A.id}->${B.id}`,
      type: 'InheritanceLink',
      name: `Inheritance(${A.name},${B.name})`,
      outgoing: [A.id, B.id],
      truthValue: tv
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 2 && 
           atoms.every(atom => atom.truthValue !== undefined);
  }
}