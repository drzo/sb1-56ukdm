import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class IntensionalDifferenceRule extends BasePLNRule {
  readonly name = 'IntensionalDifference';
  readonly description = 'Compute conceptual differences based on intensional properties';
  readonly category = 'Intensional';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    // Calculate difference based on property divergence
    const differenceTv: TruthValue = {
      strength: Math.abs(A.truthValue.strength - B.truthValue.strength),
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence) * 0.9
    };

    return [this.createResultAtom(
      `int-diff-${A.id}-${B.id}`,
      'IntensionalDifferenceLink',
      `IntensionalDifference(${A.name},${B.name})`,
      [A.id, B.id],
      differenceTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}