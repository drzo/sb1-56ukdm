import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class EquivalenceRule extends BasePLNRule {
  readonly name = 'Equivalence';
  readonly description = 'Determine if two concepts are equivalent';
  readonly category = 'Core';
  readonly computationalCost = 0.5;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    // Calculate bidirectional similarity
    const forwardStrength = A.truthValue.strength / Math.max(0.0001, B.truthValue.strength);
    const backwardStrength = B.truthValue.strength / Math.max(0.0001, A.truthValue.strength);
    
    const equivalenceTv: TruthValue = {
      strength: Math.min(forwardStrength, backwardStrength),
      confidence: A.truthValue.confidence * B.truthValue.confidence * 0.9
    };

    return [this.createResultAtom(
      `equiv-${A.id}-${B.id}`,
      'EquivalenceLink',
      `Equivalence(${A.name},${B.name})`,
      [A.id, B.id],
      equivalenceTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms[0].truthValue!.strength > 0 &&
           atoms[1].truthValue!.strength > 0;
  }
}