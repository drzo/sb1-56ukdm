import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class ExtensionalSimilarityRule extends BasePLNRule {
  readonly name = 'ExtensionalSimilarity';
  readonly description = 'Compute similarity between concepts based on shared members';
  readonly category = 'Core';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    // Calculate Jaccard-like similarity
    const intersection = Math.min(A.truthValue.strength, B.truthValue.strength);
    const union = Math.max(A.truthValue.strength, B.truthValue.strength);
    
    const similarityTv: TruthValue = {
      strength: intersection / Math.max(0.0001, union),
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence) * 0.9
    };

    return [this.createResultAtom(
      `extensional-sim-${A.id}-${B.id}`,
      'SimilarityLink',
      `ExtensionalSimilarity(${A.name},${B.name})`,
      [A.id, B.id],
      similarityTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}