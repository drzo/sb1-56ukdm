import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class SymmetryRule extends BasePLNRule {
  readonly name = 'Symmetry';
  readonly description = 'If A is related to B, then B is related to A';
  readonly category = 'Core';
  readonly computationalCost = 0.2;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 1)) return [];
    
    const [relation] = atoms;
    if (!relation.truthValue || !relation.outgoing || relation.outgoing.length !== 2) return [];

    const [A, B] = relation.outgoing;

    return [this.createResultAtom(
      `sym-${B}-${A}`,
      relation.type,
      `Symmetry(${B},${A})`,
      [B, A],
      relation.truthValue
    )];
  }

  validate(atoms: Atom[]): boolean {
    if (!super.validateAtoms(atoms, 1)) return false;
    
    const [relation] = atoms;
    return ['SimilarityLink', 'EquivalenceLink'].includes(relation.type) &&
           relation.outgoing?.length === 2;
  }
}