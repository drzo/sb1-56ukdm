import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalAdaptationRule extends BasePLNRule {
  readonly name = 'TemporalAdaptation';
  readonly description = 'Adapt rules based on temporal patterns and history';
  readonly category = 'Meta';
  readonly computationalCost = 0.9;

  private temporalHistory: Map<string, { timestamp: number; performance: number }[]> = new Map();

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [rule, timeContext, performance] = atoms;
    if (!rule.truthValue || !timeContext.truthValue || !performance.truthValue) return [];

    // Update temporal history
    this.updateTemporalHistory(rule.id, performance.truthValue.strength);

    const adaptationTv: TruthValue = {
      strength: this.calculateTemporalStrength(rule, timeContext, performance),
      confidence: this.calculateTemporalConfidence(rule, timeContext)
    };

    return [this.createResultAtom(
      `temporal-adapt-${rule.id}`,
      'TemporalAdaptationLink',
      `TemporalAdaptation(${rule.name})`,
      [rule.id, timeContext.id],
      adaptationTv
    )];
  }

  private updateTemporalHistory(ruleId: string, performance: number): void {
    const history = this.temporalHistory.get(ruleId) || [];
    history.push({
      timestamp: Date.now(),
      performance
    });
    this.temporalHistory.set(ruleId, history);
  }

  private calculateTemporalStrength(
    rule: Atom,
    timeContext: Atom,
    performance: Atom
  ): number {
    const baseStrength = rule.truthValue!.strength;
    const temporalFactor = this.getTemporalTrend(rule.id);
    const performanceFactor = performance.truthValue!.strength;
    
    return (baseStrength * 0.3) + 
           (temporalFactor * 0.4) + 
           (performanceFactor * 0.3);
  }

  private getTemporalTrend(ruleId: string): number {
    const history = this.temporalHistory.get(ruleId) || [];
    if (history.length < 2) return 0.5;

    const recentPerformances = history
      .slice(-5)
      .map(h => h.performance);
    
    return recentPerformances.reduce((a, b) => a + b, 0) / recentPerformances.length;
  }

  private calculateTemporalConfidence(rule: Atom, timeContext: Atom): number {
    const history = this.temporalHistory.get(rule.id) || [];
    const historyFactor = Math.min(1, history.length / 10);
    
    return Math.min(
      rule.truthValue!.confidence,
      timeContext.truthValue!.confidence
    ) * (0.6 + 0.4 * historyFactor);
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}