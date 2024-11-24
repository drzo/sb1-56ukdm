import { AtomType, Pattern } from '../types';
import { TypeHierarchy } from './type-hierarchy';

export class TypeRules {
  constructor(private hierarchy: TypeHierarchy) {}

  validateTypeRule(type: AtomType, pattern: Pattern): boolean {
    // Basic type validation
    if (!this.isValidType(type)) return false;

    // Check type compatibility with pattern
    if (pattern.type && !this.hierarchy.isSubtype(type, pattern.type)) {
      return false;
    }

    // Check type restrictions
    if (pattern.typeRestriction) {
      return this.validateTypeRestriction(type, pattern.typeRestriction);
    }

    return true;
  }

  private isValidType(type: AtomType): boolean {
    return this.hierarchy.getAllTypes().includes(type);
  }

  private validateTypeRestriction(
    type: AtomType,
    restriction: AtomType | AtomType[]
  ): boolean {
    if (Array.isArray(restriction)) {
      return restriction.some(t => this.hierarchy.isSubtype(type, t));
    }
    return this.hierarchy.isSubtype(type, restriction);
  }

  // Type composition rules
  composeTypes(type1: AtomType, type2: AtomType): AtomType {
    // If one is a subtype of the other, use the more specific type
    if (this.hierarchy.isSubtype(type1, type2)) return type1;
    if (this.hierarchy.isSubtype(type2, type1)) return type2;

    // Find most specific common supertype
    return this.hierarchy.getMostSpecificCommonType([type1, type2]);
  }

  // Type inference rules
  inferTypeFromPattern(pattern: Pattern): AtomType {
    if (pattern.type) return pattern.type;

    if (pattern.outgoing) {
      return this.inferTypeFromOutgoing(pattern);
    }

    if (pattern.isVariable) {
      return this.inferVariableType(pattern);
    }

    return 'Node';
  }

  private inferTypeFromOutgoing(pattern: Pattern): AtomType {
    if (!pattern.outgoing) return 'Link';

    // Special cases for common link patterns
    if (this.isEvaluationPattern(pattern)) return 'EvaluationLink';
    if (this.isInheritancePattern(pattern)) return 'InheritanceLink';
    if (this.isOrderedPattern(pattern)) return 'OrderedLink';

    return 'Link';
  }

  private inferVariableType(pattern: Pattern): AtomType {
    if (pattern.typeRestriction) {
      return Array.isArray(pattern.typeRestriction)
        ? pattern.typeRestriction[0]
        : pattern.typeRestriction;
    }
    return 'Node';
  }

  private isEvaluationPattern(pattern: Pattern): boolean {
    return pattern.outgoing?.length === 2 &&
           typeof pattern.outgoing[0] !== 'string' &&
           pattern.outgoing[0].type === 'PredicateNode';
  }

  private isInheritancePattern(pattern: Pattern): boolean {
    return pattern.outgoing?.length === 2 &&
           pattern.outgoing.every(p =>
             typeof p !== 'string' && p.type === 'ConceptNode'
           );
  }

  private isOrderedPattern(pattern: Pattern): boolean {
    return pattern.outgoing !== undefined &&
           pattern.outgoing.length > 0;
  }
}