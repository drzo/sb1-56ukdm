import { Atom, TruthValue } from '../../types/atom';
import { PLNRule } from './pln-rule';

export class SymmetryRule implements PLNRule {
  name = 'Symmetry';
  description = 'If A is related to B, then B is related to A';

  apply(atoms: Atom[]): Atom[] {
    if (!this.validate(atoms)) return [];
    
    const [relation] = atoms;
    if (!relation.truthValue || !relation.outgoing || relation.outgoing.length !== 2) return [];
    
    const [A, B] = relation.outgoing;

    return [{
      id: `${B}~${A}`,
      type: relation.type,
      name: `Symmetry(${B},${A})`,
      outgoing: [B, A],
      truthValue: relation.truthValue
    }];
  }

  validate(atoms: Atom[]): boolean {
    if (atoms.length !== 1) return false;
    
    const [relation] = atoms;
    return ['SimilarityLink', 'EquivalenceLink'].includes(relation.type) &&
           relation.outgoing?.length === 2;
  }
}