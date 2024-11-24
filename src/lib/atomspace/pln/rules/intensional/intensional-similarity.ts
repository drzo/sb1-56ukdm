import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class IntensionalSimilarityRule extends BasePLNRule {
  readonly name = 'IntensionalSimilarity';
  readonly description = 'Compute similarity between concepts based on shared intensional properties';
  readonly category = 'Intensional';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue || !A.attention || !B.attention) return [];

    // Calculate similarity based on shared properties and attention
    const attentionFactor = Math.min(
      A.attention.sti / 100,
      B.attention.sti / 100
    );

    const similarityTv: TruthValue = {
      strength: Math.sqrt(A.truthValue.strength * B.truthValue.strength) * 
                (0.8 + 0.2 * attentionFactor),
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence) * 
                 attentionFactor
    };

    return [this.createResultAtom(
      `int-sim-${A.id}-${B.id}`,
      'IntensionalSimilarityLink',
      `IntensionalSimilarity(${A.name},${B.name})`,
      [A.id, B.id],
      similarityTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.attention !== undefined);
  }
}