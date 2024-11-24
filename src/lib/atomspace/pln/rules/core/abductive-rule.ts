import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class AbductiveRule extends BasePLNRule {
  readonly name = 'Abduction';
  readonly description = 'Infer possible explanations through backward reasoning';
  readonly category = 'Core';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [A, B, C] = atoms;
    if (!A.truthValue || !B.truthValue || !C.truthValue) return [];

    // Calculate abductive inference strength
    const strength = Math.sqrt(A.truthValue.strength * C.truthValue.strength);
    const confidence = A.truthValue.confidence * C.truthValue.confidence * 0.7;

    const abductiveTv: TruthValue = {
      strength: Math.min(1, Math.max(0, strength)),
      confidence: Math.min(1, Math.max(0, confidence))
    };

    return [this.createResultAtom(
      `abduction-${A.id}-${C.id}`,
      'AbductiveLink',
      `Abduction(${A.name},${C.name})`,
      [A.id, C.id],
      abductiveTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}