import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class IntensionalEvaluationRule extends BasePLNRule {
  readonly name = 'IntensionalEvaluation';
  readonly description = 'Evaluate intensional relationships considering attention and context';
  readonly category = 'Intensional';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [concept, predicate, context] = atoms;
    if (!concept.truthValue || !predicate.truthValue || !context.truthValue) return [];

    // Calculate evaluation strength considering context
    const contextualStrength = concept.truthValue.strength * 
                             predicate.truthValue.strength *
                             context.truthValue.strength;

    const contextualConfidence = Math.min(
      concept.truthValue.confidence,
      predicate.truthValue.confidence,
      context.truthValue.confidence
    ) * 0.9;

    const evaluationTv: TruthValue = {
      strength: Math.min(1, Math.max(0, contextualStrength)),
      confidence: Math.min(1, Math.max(0, contextualConfidence))
    };

    return [this.createResultAtom(
      `int-eval-${concept.id}-${predicate.id}`,
      'IntensionalEvaluationLink',
      `IntensionalEvaluation(${concept.name},${predicate.name})`,
      [concept.id, predicate.id, context.id],
      evaluationTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms[0].type === 'ConceptNode' &&
           atoms[1].type === 'PredicateNode';
  }
}