import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class RuleAdaptationRule extends BasePLNRule {
  readonly name = 'RuleAdaptation';
  readonly description = 'Adapt rules based on context and performance history';
  readonly category = 'Meta';
  readonly computationalCost = 0.9;

  private adaptationHistory: Map<string, number> = new Map();

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [rule, context, performance] = atoms;
    if (!rule.truthValue || !context.truthValue || !performance.truthValue) return [];

    // Update adaptation history
    this.updateAdaptationHistory(rule.id, performance.truthValue.strength);

    // Calculate adaptation strength
    const adaptationTv: TruthValue = {
      strength: this.calculateAdaptationStrength(rule, context, performance),
      confidence: this.calculateAdaptationConfidence(rule, context)
    };

    return [this.createResultAtom(
      `rule-adapt-${rule.id}`,
      'RuleAdaptationLink',
      `RuleAdaptation(${rule.name})`,
      [rule.id, context.id],
      adaptationTv
    )];
  }

  private updateAdaptationHistory(ruleId: string, performance: number): void {
    const currentScore = this.adaptationHistory.get(ruleId) || 0;
    this.adaptationHistory.set(ruleId, (currentScore + performance) / 2);
  }

  private calculateAdaptationStrength(
    rule: Atom,
    context: Atom,
    performance: Atom
  ): number {
    const baseStrength = rule.truthValue!.strength;
    const contextFactor = context.truthValue!.strength;
    const performanceFactor = performance.truthValue!.strength;
    
    // Weighted combination of factors
    return (baseStrength * 0.4) + 
           (contextFactor * 0.3) + 
           (performanceFactor * 0.3);
  }

  private calculateAdaptationConfidence(rule: Atom, context: Atom): number {
    const historicalPerformance = this.adaptationHistory.get(rule.id) || 0.5;
    
    return Math.min(
      rule.truthValue!.confidence,
      context.truthValue!.confidence
    ) * (0.7 + 0.3 * historicalPerformance);
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}