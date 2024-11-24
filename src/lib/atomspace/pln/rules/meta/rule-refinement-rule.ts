import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class RuleRefinementRule extends BasePLNRule {
  readonly name = 'RuleRefinement';
  readonly description = 'Refine rules by combining successful patterns';
  readonly category = 'Meta';
  readonly computationalCost = 0.9;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [rule1, rule2, context] = atoms;
    if (!rule1.truthValue || !rule2.truthValue || !context.truthValue) return [];

    // Calculate refinement strength
    const refinementTv: TruthValue = {
      strength: this.calculateRefinementStrength(rule1, rule2, context),
      confidence: this.calculateRefinementConfidence(rule1, rule2)
    };

    return [this.createResultAtom(
      `rule-refine-${rule1.id}-${rule2.id}`,
      'RuleRefinementLink',
      `RuleRefinement(${rule1.name},${rule2.name})`,
      [rule1.id, rule2.id, context.id],
      refinementTv
    )];
  }

  private calculateRefinementStrength(
    rule1: Atom,
    rule2: Atom,
    context: Atom
  ): number {
    const combinedStrength = (rule1.truthValue!.strength + rule2.truthValue!.strength) / 2;
    const contextualFactor = context.truthValue!.strength;
    
    // Refinement strength increases with complementary rules
    return combinedStrength * (0.7 + 0.3 * contextualFactor);
  }

  private calculateRefinementConfidence(rule1: Atom, rule2: Atom): number {
    // Confidence based on individual rule confidences
    return Math.min(
      rule1.truthValue!.confidence,
      rule2.truthValue!.confidence
    ) * 0.85;
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}