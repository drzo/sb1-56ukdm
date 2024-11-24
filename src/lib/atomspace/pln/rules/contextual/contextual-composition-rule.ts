import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class ContextualCompositionRule extends BasePLNRule {
  readonly name = 'ContextualComposition';
  readonly description = 'Compose relationships while considering context';
  readonly category = 'Contextual';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [rel1, rel2, context] = atoms;
    if (!rel1.truthValue || !rel2.truthValue || !context.truthValue) return [];

    // Calculate composition strength with context influence
    const baseStrength = Math.min(rel1.truthValue.strength, rel2.truthValue.strength);
    const contextualFactor = context.truthValue.strength;

    const compositionTv: TruthValue = {
      strength: baseStrength * contextualFactor,
      confidence: Math.min(
        rel1.truthValue.confidence,
        rel2.truthValue.confidence,
        context.truthValue.confidence
      ) * 0.8
    };

    return [this.createResultAtom(
      `ctx-comp-${rel1.id}-${rel2.id}`,
      'ContextualCompositionLink',
      `ContextualComposition(${rel1.name},${rel2.name})`,
      [rel1.id, rel2.id, context.id],
      compositionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}