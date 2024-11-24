import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class AnalogyRule extends BasePLNRule {
  readonly name = 'Analogy';
  readonly description = 'Infer relationships through analogical reasoning';
  readonly category = 'Core';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 4)) return [];
    
    const [A1, B1, A2, B2] = atoms;
    if (!A1.truthValue || !B1.truthValue || !A2.truthValue || !B2.truthValue) return [];

    // Calculate similarity between relationships
    const rel1Strength = Math.abs(A1.truthValue.strength - B1.truthValue.strength);
    const rel2Strength = Math.abs(A2.truthValue.strength - B2.truthValue.strength);
    
    const analogyTv: TruthValue = {
      strength: 1 - Math.abs(rel1Strength - rel2Strength),
      confidence: Math.min(
        A1.truthValue.confidence,
        B1.truthValue.confidence,
        A2.truthValue.confidence,
        B2.truthValue.confidence
      ) * 0.8
    };

    return [this.createResultAtom(
      `analogy-${A1.id}${B1.id}-${A2.id}${B2.id}`,
      'AnalogyLink',
      `Analogy((${A1.name},${B1.name}),(${A2.name},${B2.name}))`,
      [A1.id, B1.id, A2.id, B2.id],
      analogyTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 4) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}