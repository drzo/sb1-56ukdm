import { Atom, TruthValue } from '../../types/atom';
import { PLNRule } from './pln-rule';

export class InductionRule implements PLNRule {
  name = 'Induction';
  description = 'Infer general patterns from specific instances';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [specific, general] = atoms;
    if (!specific.truthValue || !general.truthValue) return [];

    const tv: TruthValue = {
      strength: (specific.truthValue.strength * general.truthValue.strength) / 
                (specific.truthValue.strength + general.truthValue.strength - 
                 specific.truthValue.strength * general.truthValue.strength),
      confidence: specific.truthValue.confidence * general.truthValue.confidence * 0.8
    };

    return [{
      id: `${specific.id}=>${general.id}`,
      type: 'InheritanceLink',
      name: `Induction(${specific.name},${general.name})`,
      outgoing: [specific.id, general.id],
      truthValue: tv
    }];
  }

  validate(atoms: Atom[]): boolean {
    return atoms.length === 2 && 
           atoms.every(atom => atom.truthValue !== undefined);
  }
}