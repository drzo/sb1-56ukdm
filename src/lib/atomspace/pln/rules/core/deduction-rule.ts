import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class DeductionRule extends BasePLNRule {
  readonly name = 'Deduction';
  readonly description = 'If A implies B and B implies C, then A implies C';
  readonly category = 'Core';
  readonly computationalCost = 0.3;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [A, B, C] = atoms;
    if (!A.truthValue || !B.truthValue || !C.truthValue) return [];

    // Calculate deduction strength and confidence
    const strength = A.truthValue.strength * B.truthValue.strength;
    const confidence = A.truthValue.confidence * B.truthValue.confidence * 0.9;

    const deductionTv: TruthValue = {
      strength: Math.min(1, Math.max(0, strength)),
      confidence: Math.min(1, Math.max(0, confidence))
    };

    return [this.createResultAtom(
      `deduction-${A.id}-${C.id}`,
      'ImplicationLink',
      `Deduction(${A.name},${C.name})`,
      [A.id, C.id],
      deductionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    if (!super.validateAtoms(atoms, 3)) return false;
    
    // Check for proper implication chain
    const [A, B, C] = atoms;
    return A.outgoing?.includes(B.id) && B.outgoing?.includes(C.id);
  }
}