import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class SubsetDeductionRule extends BasePLNRule {
  readonly name = 'SubsetDeduction';
  readonly description = 'If A is a subset of B and B is a subset of C, then A is a subset of C';
  readonly category = 'Core';
  readonly computationalCost = 0.6;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [A, B, C] = atoms;
    if (!A.truthValue || !B.truthValue || !C.truthValue) return [];

    // Calculate subset deduction strength
    const strength = Math.min(
      A.truthValue.strength / Math.max(0.0001, B.truthValue.strength),
      B.truthValue.strength / Math.max(0.0001, C.truthValue.strength)
    );

    const confidence = A.truthValue.confidence * 
                      B.truthValue.confidence * 
                      C.truthValue.confidence * 0.8;

    const deductionTv: TruthValue = {
      strength: Math.min(1, Math.max(0, strength)),
      confidence: Math.min(1, Math.max(0, confidence))
    };

    return [this.createResultAtom(
      `subset-deduction-${A.id}-${C.id}`,
      'SubsetLink',
      `SubsetDeduction(${A.name},${C.name})`,
      [A.id, C.id],
      deductionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}