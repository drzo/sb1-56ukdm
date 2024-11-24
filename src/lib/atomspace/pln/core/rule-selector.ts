import { Atom } from '../../types';
import { PLNRule } from '../rules/pln-rule';
import { PLNConfig } from '../config/pln-config';
import { AttentionUtils } from '../../attention/ecan/utils/attention-utils';
import { RuleContext } from './rule-context';

export class RuleSelector {
  private attentionUtils: AttentionUtils;

  constructor(private config: PLNConfig) {
    this.attentionUtils = new AttentionUtils(config);
  }

  selectRules(
    rules: PLNRule[],
    atoms: Atom[],
    context?: RuleContext
  ): PLNRule[] {
    // Filter rules based on basic applicability
    const applicableRules = rules.filter(rule => 
      this.isRuleApplicable(rule, atoms, context)
    );

    // Score and rank rules
    const scoredRules = applicableRules.map(rule => ({
      rule,
      score: this.calculateRuleScore(rule, atoms, context)
    }));

    // Sort by score and take top rules
    return scoredRules
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxActiveRules)
      .map(scored => scored.rule);
  }

  private isRuleApplicable(
    rule: PLNRule,
    atoms: Atom[],
    context?: RuleContext
  ): boolean {
    // Check basic applicability
    if (!rule.validate(atoms)) return false;

    // Check attention threshold
    if (!this.meetsAttentionThreshold(atoms)) return false;

    // Check truth value requirements
    if (!this.meetsTruthValueRequirements(atoms)) return false;

    // Check contextual constraints
    if (context && !this.meetsContextualConstraints(rule, atoms, context)) {
      return false;
    }

    return true;
  }

  private calculateRuleScore(
    rule: PLNRule,
    atoms: Atom[],
    context?: RuleContext
  ): number {
    let score = 0;

    // Base score from rule priority
    score += this.getRulePriorityScore(rule);

    // Score from atom importance
    score += this.getAtomImportanceScore(atoms);

    // Score from truth value confidence
    score += this.getTruthValueScore(atoms);

    // Contextual relevance score
    if (context) {
      score += this.getContextualRelevanceScore(rule, atoms, context);
    }

    return score;
  }

  private getRulePriorityScore(rule: PLNRule): number {
    // Higher score for more specific rules
    switch (rule.category) {
      case 'Deductive':
        return 1.0;
      case 'Intensional':
        return 0.9;
      case 'Contextual':
        return 0.8;
      case 'Fuzzy':
        return 0.7;
      default:
        return 0.5;
    }
  }

  private getAtomImportanceScore(atoms: Atom[]): number {
    return atoms.reduce((sum, atom) => {
      if (!atom.attention) return sum;
      return sum + this.attentionUtils.calculateImportance(atom);
    }, 0) / atoms.length;
  }

  private getTruthValueScore(atoms: Atom[]): number {
    return atoms.reduce((sum, atom) => {
      if (!atom.truthValue) return sum;
      return sum + (atom.truthValue.strength * atom.truthValue.confidence);
    }, 0) / atoms.length;
  }

  private getContextualRelevanceScore(
    rule: PLNRule,
    atoms: Atom[],
    context: RuleContext
  ): number {
    let score = 0;

    // Check goal relevance
    if (context.goal && this.isRelevantToGoal(rule, atoms, context.goal)) {
      score += 0.3;
    }

    // Check inference history
    if (context.history && this.hasSuccessfulHistory(rule, context.history)) {
      score += 0.2;
    }

    // Check resource constraints
    score += this.getResourceScore(rule, context.resources);

    return score;
  }

  private isRelevantToGoal(rule: PLNRule, atoms: Atom[], goal: Atom): boolean {
    // Check if rule output type matches goal type
    return atoms.some(atom => atom.type === goal.type);
  }

  private hasSuccessfulHistory(
    rule: PLNRule,
    history: { ruleId: string; success: boolean }[]
  ): boolean {
    const ruleHistory = history.filter(h => h.ruleId === rule.name);
    if (ruleHistory.length === 0) return false;

    const successRate = ruleHistory.filter(h => h.success).length / ruleHistory.length;
    return successRate > 0.5;
  }

  private getResourceScore(
    rule: PLNRule,
    resources: { computationalCost: number }
  ): number {
    // Prefer rules with lower computational cost when resources are limited
    const costFactor = 1 - (rule.computationalCost || 0.5) / resources.computationalCost;
    return Math.max(0, costFactor * 0.2);
  }

  private meetsAttentionThreshold(atoms: Atom[]): boolean {
    return atoms.every(atom =>
      atom.attention !== undefined &&
      atom.attention.sti > this.config.attentionThreshold
    );
  }

  private meetsTruthValueRequirements(atoms: Atom[]): boolean {
    return atoms.every(atom =>
      atom.truthValue !== undefined &&
      atom.truthValue.confidence >= this.config.minConfidence
    );
  }

  private meetsContextualConstraints(
    rule: PLNRule,
    atoms: Atom[],
    context: RuleContext
  ): boolean {
    // Check temporal constraints
    if (context.temporal && !this.meetsTemporalConstraints(rule, context.temporal)) {
      return false;
    }

    // Check resource constraints
    if (context.resources && !this.meetsResourceConstraints(rule, context.resources)) {
      return false;
    }

    return true;
  }

  private meetsTemporalConstraints(
    rule: PLNRule,
    temporal: { maxAge: number }
  ): boolean {
    return rule.temporalCost !== undefined && 
           rule.temporalCost <= temporal.maxAge;
  }

  private meetsResourceConstraints(
    rule: PLNRule,
    resources: { computationalCost: number }
  ): boolean {
    return rule.computationalCost !== undefined && 
           rule.computationalCost <= resources.computationalCost;
  }
}