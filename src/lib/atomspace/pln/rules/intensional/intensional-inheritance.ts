import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class IntensionalInheritanceRule extends BasePLNRule {
  readonly name = 'IntensionalInheritance';
  readonly description = 'Derive inheritance relationships based on shared intensional properties';
  readonly category = 'Intensional';
  readonly computationalCost = 0.6;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue || !A.attention || !B.attention) return [];

    // Consider attention values in the calculation
    const attentionFactor = Math.min(
      A.attention.sti / 100,
      B.attention.sti / 100
    );

    // Calculate intensional inheritance strength
    const strength = A.truthValue.strength * (1 - Math.abs(A.truthValue.strength - B.truthValue.strength));
    const confidence = A.truthValue.confidence * B.truthValue.confidence * attentionFactor;

    const inheritanceTv: TruthValue = {
      strength: Math.min(1, Math.max(0, strength)),
      confidence: Math.min(1, Math.max(0, confidence))
    };

    return [this.createResultAtom(
      `int-inh-${A.id}-${B.id}`,
      'IntensionalInheritanceLink',
      `IntensionalInheritance(${A.name},${B.name})`,
      [A.id, B.id],
      inheritanceTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.attention !== undefined);
  }
}