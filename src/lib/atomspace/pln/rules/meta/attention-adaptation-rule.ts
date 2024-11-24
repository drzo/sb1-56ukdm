import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class AttentionAdaptationRule extends BasePLNRule {
  readonly name = 'AttentionAdaptation';
  readonly description = 'Adapt rules based on attention dynamics';
  readonly category = 'Meta';
  readonly computationalCost = 0.8;

  private attentionHistory: Map<string, number[]> = new Map();

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [rule, attentionContext, performance] = atoms;
    if (!rule.truthValue || !attentionContext.truthValue || !performance.truthValue) return [];

    // Update attention history
    this.updateAttentionHistory(rule.id, rule.attention?.sti || 0);

    const adaptationTv: TruthValue = {
      strength: this.calculateAttentionStrength(rule, attentionContext, performance),
      confidence: this.calculateAttentionConfidence(rule, attentionContext)
    };

    return [this.createResultAtom(
      `attention-adapt-${rule.id}`,
      'AttentionAdaptationLink',
      `AttentionAdaptation(${rule.name})`,
      [rule.id, attentionContext.id],
      adaptationTv
    )];
  }

  private updateAttentionHistory(ruleId: string, sti: number): void {
    const history = this.attentionHistory.get(ruleId) || [];
    history.push(sti);
    if (history.length > 10) history.shift();
    this.attentionHistory.set(ruleId, history);
  }

  private calculateAttentionStrength(
    rule: Atom,
    attentionContext: Atom,
    performance: Atom
  ): number {
    const baseStrength = rule.truthValue!.strength;
    const attentionFactor = this.getAttentionTrend(rule.id);
    const performanceFactor = performance.truthValue!.strength;
    
    return (baseStrength * 0.3) + 
           (attentionFactor * 0.4) + 
           (performanceFactor * 0.3);
  }

  private getAttentionTrend(ruleId: string): number {
    const history = this.attentionHistory.get(ruleId) || [];
    if (history.length < 2) return 0.5;

    const trend = history.slice(-1)[0] - history[0];
    return Math.min(1, Math.max(0, (trend + 100) / 200));
  }

  private calculateAttentionConfidence(rule: Atom, attentionContext: Atom): number {
    const history = this.attentionHistory.get(rule.id) || [];
    const stabilityFactor = this.calculateStability(history);
    
    return Math.min(
      rule.truthValue!.confidence,
      attentionContext.truthValue!.confidence
    ) * (0.6 + 0.4 * stabilityFactor);
  }

  private calculateStability(history: number[]): number {
    if (history.length < 2) return 0.5;
    
    const variations = history.slice(1).map((val, i) => 
      Math.abs(val - history[i])
    );
    
    const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
    return Math.max(0, 1 - avgVariation / 200);
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}