import { Atom } from '../../types';
import { PLNRule } from '../rules/pln-rule';
import { TruthValueValidator } from '../truth-values/validation/truth-value-validator';

export class RuleValidator {
  private tvValidator: TruthValueValidator;

  constructor() {
    this.tvValidator = new TruthValueValidator();
  }

  validateRule(rule: PLNRule, atoms: Atom[]): boolean {
    // Check basic rule validation
    if (!rule.validate(atoms)) return false;

    // Validate truth values
    if (!this.validateTruthValues(atoms)) return false;

    // Validate atom types
    if (!this.validateAtomTypes(rule, atoms)) return false;

    return true;
  }

  private validateTruthValues(atoms: Atom[]): boolean {
    return atoms.every(atom =>
      atom.truthValue !== undefined &&
      this.tvValidator.validate(atom.truthValue)
    );
  }

  private validateAtomTypes(rule: PLNRule, atoms: Atom[]): boolean {
    // This would need to be implemented based on specific rule requirements
    // For now, return true as a placeholder
    return true;
  }
}