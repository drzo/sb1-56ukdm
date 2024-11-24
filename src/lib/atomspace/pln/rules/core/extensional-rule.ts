import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class ExtensionalRule extends BasePLNRule {
  readonly name = 'Extensional';
  readonly description = 'Reason about relationships based on shared members';
  readonly category = 'Core';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [set1, set2] = atoms;
    if (!set1.truthValue || !set2.truthValue) return [];

    // Calculate extensional overlap
    const overlapStrength = this.calculateExtensionalOverlap(set1, set2);
    const overlapConfidence = Math.min(
      set1.truthValue.confidence,
      set2.truthValue.confidence
    ) * 0.9;

    // Create extensional relationship
    return [this.createResultAtom(
      `ext-${set1.id}-${set2.id}`,
      'ExtensionalLink',
      `Extensional(${set1.name},${set2.name})`,
      [set1.id, set2.id],
      {
        strength: overlapStrength,
        confidence: overlapConfidence
      }
    )];
  }

  private calculateExtensionalOverlap(set1: Atom, set2: Atom): number {
    const intersection = Math.min(
      set1.truthValue!.strength,
      set2.truthValue!.strength
    );
    
    const union = Math.max(
      set1.truthValue!.strength,
      set2.truthValue!.strength
    );

    return intersection / Math.max(0.0001, union);
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}