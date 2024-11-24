import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class InversionRule extends BasePLNRule {
  readonly name = 'Inversion';
  readonly description = 'Invert an implication using Bayes rule';
  readonly category = 'Core';
  readonly computationalCost = 0.4;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    // Apply Bayes rule: P(B|A) = P(A|B) * P(B) / P(A)
    const strength = (B.truthValue.strength * A.truthValue.strength) /
                    Math.max(0.0001, B.truthValue.strength);
    
    const confidence = A.truthValue.confidence * B.truthValue.confidence * 0.8;

    const inversionTv: TruthValue = {
      strength: Math.min(1, Math.max(0, strength)),
      confidence: Math.min(1, Math.max(0, confidence))
    };

    return [this.createResultAtom(
      `inversion-${B.id}-${A.id}`,
      'ImplicationLink',
      `Inversion(${B.name},${A.name})`,
      [B.id, A.id],
      inversionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms[0].truthValue!.strength > 0;
  }
}