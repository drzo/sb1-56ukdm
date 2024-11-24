import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class IntensionalIntersectionRule extends BasePLNRule {
  readonly name = 'IntensionalIntersection';
  readonly description = 'Find common intensional properties between concepts';
  readonly category = 'Intensional';

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    const intersectionTv: TruthValue = {
      strength: Math.min(A.truthValue.strength, B.truthValue.strength),
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence)
    };

    return [this.createResultAtom(
      `int-inter-${A.id}-${B.id}`,
      'IntensionalIntersectionLink',
      `IntensionalIntersection(${A.name},${B.name})`,
      [A.id, B.id],
      intersectionTv
    )];
  }
}