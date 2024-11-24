import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class PropertyIntersectionRule extends BasePLNRule {
  readonly name = 'PropertyIntersection';
  readonly description = 'Find common properties between concepts';
  readonly category = 'Intensional';
  readonly computationalCost = 0.5;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    // Calculate intersection strength
    const intersectionTv: TruthValue = {
      strength: Math.min(A.truthValue.strength, B.truthValue.strength),
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence)
    };

    return [this.createResultAtom(
      `prop-inter-${A.id}-${B.id}`,
      'PropertyIntersectionLink',
      `PropertyIntersection(${A.name},${B.name})`,
      [A.id, B.id],
      intersectionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}