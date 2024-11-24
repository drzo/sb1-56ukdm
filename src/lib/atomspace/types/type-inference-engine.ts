import { Atom, AtomType, Pattern } from '../types';
import { TypeHierarchy } from './type-hierarchy';
import { TypeInferenceContext } from './type-inference-context';
import { TypeValidator } from './type-validation';

export class TypeInferenceEngine {
  private validator: TypeValidator;

  constructor(
    private atomSpace: Map<string, Atom>,
    private hierarchy: TypeHierarchy
  ) {
    this.validator = new TypeValidator(hierarchy);
  }

  inferTypes(pattern: Pattern): TypeInferenceContext {
    const context = new TypeInferenceContext(this.hierarchy);
    this.inferPatternTypes(pattern, context);
    return context;
  }

  private inferPatternTypes(
    pattern: Pattern,
    context: TypeInferenceContext
  ): void {
    // Handle variable patterns
    if (pattern.isVariable && pattern.variableName) {
      this.handleVariablePattern(pattern, context);
    }

    // Handle type constraints
    if (pattern.type) {
      this.handleTypeConstraint(pattern, context);
    }

    // Handle outgoing patterns
    if (pattern.outgoing) {
      this.handleOutgoingPatterns(pattern, context);
    }

    // Handle logical operators
    if (pattern.operator && pattern.patterns) {
      this.handleOperatorPatterns(pattern, context);
    }
  }

  private handleVariablePattern(
    pattern: Pattern,
    context: TypeInferenceContext
  ): void {
    if (!pattern.variableName) return;

    if (pattern.typeRestriction) {
      if (Array.isArray(pattern.typeRestriction)) {
        pattern.typeRestriction.forEach(type =>
          context.addTypeConstraint(pattern.variableName!, type)
        );
      } else {
        context.addTypeConstraint(pattern.variableName, pattern.typeRestriction);
      }
    }
  }

  private handleTypeConstraint(
    pattern: Pattern,
    context: TypeInferenceContext
  ): void {
    if (pattern.variableName && pattern.type) {
      context.addInferredType(pattern.variableName, pattern.type);
    }
  }

  private handleOutgoingPatterns(
    pattern: Pattern,
    context: TypeInferenceContext
  ): void {
    pattern.outgoing?.forEach(outPattern => {
      if (typeof outPattern !== 'string') {
        this.inferPatternTypes(outPattern, context);
      }
    });
  }

  private handleOperatorPatterns(
    pattern: Pattern,
    context: TypeInferenceContext
  ): void {
    pattern.patterns?.forEach(subPattern => {
      this.inferPatternTypes(subPattern, context);
    });
  }

  validateTypeConsistency(pattern: Pattern): boolean {
    const context = this.inferTypes(pattern);
    
    // Check all variables for type consistency
    const allVariables = this.collectVariables(pattern);
    return allVariables.every(varName => 
      context.validateTypeConsistency(varName)
    );
  }

  private collectVariables(pattern: Pattern): string[] {
    const variables: string[] = [];

    if (pattern.isVariable && pattern.variableName) {
      variables.push(pattern.variableName);
    }

    if (pattern.patterns) {
      pattern.patterns.forEach(p => 
        variables.push(...this.collectVariables(p))
      );
    }

    if (pattern.outgoing) {
      pattern.outgoing.forEach(p => {
        if (typeof p !== 'string') {
          variables.push(...this.collectVariables(p));
        }
      });
    }

    return [...new Set(variables)];
  }
}