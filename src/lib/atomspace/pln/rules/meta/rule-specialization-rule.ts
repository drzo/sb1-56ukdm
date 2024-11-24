import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class RuleSpecializationRule extends BasePLNRule {
  readonly name = 'RuleSpecialization';
  readonly description = 'Create specialized versions of rules for specific contexts';
  readonly category = 'Meta';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [rule, context, constraints] = atoms;
    if (!rule.truthValue || !context.truthValue || !constraints.truthValue) return [];

    // Calculate specialization strength
    const specializationTv: TruthValue = {
      strength: this.calculateSpecializationStrength(rule, context, constraints),
      confidence: this.calculateSpecializationConfidence(rule, context)
    };

    return [this.createResultAtom(
      `rule-spec-${rule.id}-${context.id}`,
      'RuleSpecializationLink',
      `RuleSpecialization(${rule.name},${context.name})`,
      [rule.id, context.id, constraints.id],
      specializationTv
    )];
  }

  private calculateSpecializationStrength(
    rule: Atom,
    context: Atom,
    constraints: Atom
  ): number {
    const ruleStrength = rule.truthValue!.strength;
    const contextRelevance = context.truthValue!.strength;
    const constraintSatisfaction = constraints.truthValue!.strength;

    // Higher strength for more specific and constrained specializations
    return (ruleStrength * 0.4) + 
           (contextRelevance * 0.3) + 
           (constraintSatisfaction * 0.3);
  }

  private calculateSpecializationConfidence(rule: Atom, context: Atom): number {
    // Confidence decreases with specialization to reflect increased specificity
    return Math.min(
      rule.truthValue!.confidence,
      context.truthValue!.confidence
    ) * 0.8;
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}