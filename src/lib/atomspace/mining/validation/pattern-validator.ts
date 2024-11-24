import { Pattern, AtomType } from '../../../types';

export class PatternValidator {
  private static readonly VALID_TYPES: AtomType[] = [
    'ConceptNode',
    'PredicateNode',
    'ListLink',
    'EvaluationLink',
    'VariableNode'
  ];

  static validatePattern(pattern: Pattern): boolean {
    return this.validateType(pattern) &&
           this.validateOperator(pattern) &&
           this.validateRecursion(pattern) &&
           this.validateVariables(pattern);
  }

  private static validateType(pattern: Pattern): boolean {
    if (!pattern.type) return true;
    return this.VALID_TYPES.includes(pattern.type);
  }

  private static validateOperator(pattern: Pattern): boolean {
    if (!pattern.operator) return true;
    if (!pattern.patterns || pattern.patterns.length === 0) return false;
    
    if (pattern.operator === 'NOT' && pattern.patterns.length !== 1) {
      return false;
    }

    return pattern.patterns.every(p => this.validatePattern(p));
  }

  private static validateRecursion(pattern: Pattern): boolean {
    if (!pattern.recursive) return true;

    const { maxDepth, followLinks, detectCycles } = pattern.recursive;

    if (maxDepth !== undefined && (typeof maxDepth !== 'number' || maxDepth < 0)) {
      return false;
    }

    if (followLinks !== undefined && typeof followLinks !== 'boolean') {
      return false;
    }

    if (detectCycles !== undefined && typeof detectCycles !== 'boolean') {
      return false;
    }

    return true;
  }

  private static validateVariables(pattern: Pattern): boolean {
    if (!pattern.isVariable) return true;
    if (!pattern.variableName) return false;
    
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(pattern.variableName);
  }
}