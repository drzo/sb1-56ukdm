import { Pattern } from '../../../types';

export class ComplexityCalculator {
  calculatePatternComplexity(pattern: Pattern): number {
    return this.calculateStructuralComplexity(pattern) * 
           this.calculateConstraintComplexity(pattern);
  }

  private calculateStructuralComplexity(pattern: Pattern): number {
    let complexity = 1;

    if (pattern.patterns) {
      complexity += pattern.patterns.reduce((sum, p) => 
        sum + this.calculateStructuralComplexity(p), 0
      );
    }

    if (pattern.outgoing) {
      complexity += pattern.outgoing.reduce((sum, p) => 
        sum + (typeof p === 'string' ? 1 : this.calculateStructuralComplexity(p)), 0
      );
    }

    return complexity;
  }

  private calculateConstraintComplexity(pattern: Pattern): number {
    let multiplier = 1;

    if (pattern.isVariable) multiplier *= 1.2;
    if (pattern.recursive) multiplier *= 1.5;
    if (pattern.tvOperator) multiplier *= 1.3;
    if (pattern.operator) multiplier *= 1.2;

    return multiplier;
  }

  getComplexityDescription(pattern: Pattern): string {
    const structural = this.calculateStructuralComplexity(pattern);
    const constraint = this.calculateConstraintComplexity(pattern);
    const total = structural * constraint;

    return {
      total,
      structural,
      constraint,
      details: this.getComplexityDetails(pattern)
    };
  }

  private getComplexityDetails(pattern: Pattern): string[] {
    const details: string[] = [];

    if (pattern.isVariable) {
      details.push('Variable binding');
    }

    if (pattern.recursive) {
      details.push(`Recursive (max depth: ${pattern.recursive.maxDepth})`);
    }

    if (pattern.tvOperator) {
      details.push(`Truth value operation: ${pattern.tvOperator}`);
    }

    if (pattern.operator) {
      details.push(`Logical operator: ${pattern.operator}`);
    }

    return details;
  }
}