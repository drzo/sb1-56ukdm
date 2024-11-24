import { Atom, TruthValue } from '../../types';
import { PLNRule } from './pln-rule';
import { calculateDeduction } from '../truth-values/operations';

export class ModusPonensRule implements PLNRule {
  name = 'Modus Ponens';
  description = 'If A is true and A implies B, then B is true';

  apply(atoms: Atom[]): Atom[] {
    if (atoms.length < 2) return [];
    
    const [premise, implication] = atoms;
    if (!premise.truthValue || !implication.truthValue) return [];
    if (implication.type !== 'ImplicationLink') return [];
    
    const [, conclusion] = implication.outgoing || [];
    if (!conclusion) return [];

    const tv = calculateDeduction(premise.truthValue, implication.truthValue);
    
    return [{
      id: conclusion,
      type: 'ConceptNode',
      name: `ModusPonens(${premise.name})`,
      truthValue: tv
    }];
  }

  validate(atoms: Atom[]): boolean {
    if (atoms.length !== 2) return false;
    if (!atoms[1].outgoing || atoms[1].outgoing.length !== 2) return false;
    return atoms.every(atom => atom.truthValue !== undefined);
  }
}