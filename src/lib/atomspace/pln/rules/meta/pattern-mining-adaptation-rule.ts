import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class PatternMiningAdaptationRule extends BasePLNRule {
  readonly name = 'PatternMiningAdaptation';
  readonly description = 'Adapt rules based on discovered patterns';
  readonly category = 'Meta';
  readonly computationalCost = 0.9;

  private patternHistory: Map<string, Set<string>> = new Map();

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [rule, pattern, performance] = atoms;
    if (!rule.truthValue || !pattern.truthValue || !performance.truthValue) return [];

    // Update pattern history
    this.updatePatternHistory(rule.id, pattern.id);

    const adaptationTv: TruthValue = {
      strength: this.calculatePatternStrength(rule, pattern, performance),
      confidence: this.calculatePatternConfidence(rule, pattern)
    };

    return [this.createResultAtom(
      `pattern-adapt-${rule.id}`,
      'PatternMiningAdaptationLink',
      `PatternMiningAdaptation(${rule.name})`,
      [rule.id, pattern.id],
      adaptationTv
    )];
  }

  private updatePatternHistory(ruleId: string, patternId: string): void {
    const patterns = this.patternHistory.get(ruleId) || new Set();
    patterns.add(patternId);
    this.patternHistory.set(ruleId, patterns);
  }

  private calculatePatternStrength(
    rule: Atom,
    pattern: Atom,
    performance: Atom
  ): number {
    const baseStrength = rule.truthValue!.strength;
    const patternFactor = this.getPatternCoverage(rule.id);
    const performanceFactor = performance.truthValue!.strength;
    
    return (baseStrength * 0.3) + 
           (patternFactor * 0.4) + 
           (performanceFactor * 0.3);
  }

  private getPatternCoverage(ruleId: string): number {
    const patterns = this.patternHistory.get(ruleId);
    if (!patterns) return 0.5;
    
    return Math.min(1, patterns.size / 20);
  }

  private calculatePatternConfidence(rule: Atom, pattern: Atom): number {
    const patterns = this.patternHistory.get(rule.id);
    const coverageFactor = patterns ? Math.min(1, patterns.size / 10) : 0;
    
    return Math.min(
      rule.truthValue!.confidence,
      pattern.truthValue!.confidence
    ) * (0.6 + 0.4 * coverageFactor);
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}