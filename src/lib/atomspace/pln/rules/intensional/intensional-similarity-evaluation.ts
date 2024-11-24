import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class IntensionalSimilarityEvaluationRule extends BasePLNRule {
  readonly name = 'IntensionalSimilarityEvaluation';
  readonly description = 'Evaluate similarity between concepts based on shared intensional properties';
  readonly category = 'Intensional';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [A, B, context] = atoms;
    if (!A.truthValue || !B.truthValue || !context.truthValue) return [];

    // Calculate similarity considering shared properties and context
    const propertyOverlap = 1 - Math.abs(A.truthValue.strength - B.truthValue.strength);
    const contextualFactor = context.truthValue.strength;

    const similarityTv: TruthValue = {
      strength: propertyOverlap * contextualFactor,
      confidence: Math.min(
        A.truthValue.confidence,
        B.truthValue.confidence,
        context.truthValue.confidence
      ) * 0.9
    };

    return [this.createResultAtom(
      `int-sim-eval-${A.id}-${B.id}`,
      'IntensionalSimilarityEvaluationLink',
      `IntensionalSimilarityEvaluation(${A.name},${B.name})`,
      [A.id, B.id, context.id],
      similarityTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms[0].type === atoms[1].type;
  }
}