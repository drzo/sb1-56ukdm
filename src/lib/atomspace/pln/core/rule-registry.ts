import { PLNRule } from '../rules/pln-rule';
import { defaultRules } from '../rules';

export class RuleRegistry {
  private rules: Map<string, PLNRule> = new Map();

  constructor() {
    this.registerDefaultRules();
  }

  private registerDefaultRules(): void {
    defaultRules.forEach(rule => {
      this.rules.set(rule.name, rule);
    });
  }

  registerRule(rule: PLNRule): void {
    this.rules.set(rule.name, rule);
  }

  getRule(name: string): PLNRule | undefined {
    return this.rules.get(name);
  }

  getAllRules(): PLNRule[] {
    return Array.from(this.rules.values());
  }

  getRulesByCategory(category: string): PLNRule[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.category === category);
  }
}