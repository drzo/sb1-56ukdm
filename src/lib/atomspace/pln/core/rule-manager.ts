import { Atom } from '../../types';
import { PLNRule } from '../rules/pln-rule';
import { PLNConfig } from '../config/pln-config';
import { RuleSelector } from './rule-selector';
import { RuleValidator } from './rule-validator';
import { defaultRules } from '../rules';

export class RuleManager {
  private rules: PLNRule[] = [...defaultRules];
  private selector: RuleSelector;
  private validator: RuleValidator;

  constructor() {
    this.selector = new RuleSelector();
    this.validator = new RuleValidator();
  }

  registerRule(rule: PLNRule): void {
    if (this.validator.validateRuleDefinition(rule)) {
      this.rules.push(rule);
    }
  }

  getActiveRules(
    atomSpace: Map<string, Atom>,
    config: PLNConfig
  ): PLNRule[] {
    return this.selector.selectActiveRules(
      this.rules,
      atomSpace,
      config
    );
  }

  getRuleByName(name: string): PLNRule | undefined {
    return this.rules.find(rule => rule.name === name);
  }

  getRulesByCategory(category: string): PLNRule[] {
    return this.rules.filter(rule => rule.category === category);
  }

  getAllRules(): PLNRule[] {
    return [...this.rules];
  }
}