import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class IntensionalSimilarityRule extends BasePLNRule {
  readonly name = 'IntensionalSimilarity';
  readonly description = 'Compute similarity between concepts based on shared intensional properties';
  readonly category = 'Core';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    // Calculate similarity based on intensional overlap
    const propertyOverlap = 1 - Math.abs(A.truthValue.strength - B.truthValue.strength);
    
    const similarityTv: TruthValue = {
      strength: propertyOverlap,
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence) * 0.9
    };

    return [this.createResultAtom(
      `intensional-sim-${A.id}-${B.id}`,
      'SimilarityLink',
      `IntensionalSimilarity(${A.name},${B.name})`,
      [A.id, B.id],
      similarityTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}