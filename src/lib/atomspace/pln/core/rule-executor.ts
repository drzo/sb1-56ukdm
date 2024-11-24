import { Atom } from '../../types';
import { PLNConfig } from '../config/pln-config';
import { PLNRule } from '../rules/pln-rule';
import { defaultRules } from '../rules';
import { RuleSelector } from './rule-selector';
import { RuleValidator } from './rule-validator';

export class RuleExecutor {
  private rules: PLNRule[] = [...defaultRules];
  private ruleSelector: RuleSelector;
  private validator: RuleValidator;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: PLNConfig
  ) {
    this.ruleSelector = new RuleSelector(config);
    this.validator = new RuleValidator();
  }

  registerRule(rule: PLNRule): void {
    this.rules.push(rule);
  }

  executeRules(atoms: Atom[]): Atom[] {
    const applicableRules = this.ruleSelector.selectRules(
      this.rules,
      atoms
    );

    const inferences: Atom[] = [];

    for (const rule of applicableRules) {
      if (this.validator.validateRule(rule, atoms)) {
        const results = rule.apply(atoms);
        inferences.push(...this.filterValidInferences(results));
      }
    }

    return inferences;
  }

  private filterValidInferences(inferences: Atom[]): Atom[] {
    return inferences.filter(inference =>
      inference.truthValue !== undefined &&
      inference.truthValue.confidence >= this.config.minConfidence
    );
  }
}