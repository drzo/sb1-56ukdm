import { LogicalOperator, Pattern } from '../../../types';

export class OperatorValidator {
  static validateOperator(operator: LogicalOperator | undefined): boolean {
    if (!operator) return true;
    return ['AND', 'OR', 'NOT', 'CHOICE'].includes(operator);
  }

  static validateOperatorPatterns(
    operator: LogicalOperator | undefined,
    patterns: Pattern[] | undefined
  ): boolean {
    if (!operator || !patterns) return true;
    if (patterns.length === 0) return false;

    switch (operator) {
      case 'NOT':
        return patterns.length === 1;
      case 'CHOICE':
        return patterns.length >= 2;
      default:
        return patterns.length >= 2;
    }
  }
}