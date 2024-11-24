import { Atom, AtomType, Pattern } from '../types';
import { TypeHierarchy } from './type-hierarchy';
import { TypeInferenceContext } from './type-inference-context';

export class TypeInferenceOptimizer {
  constructor(
    private hierarchy: TypeHierarchy,
    private atomSpace: Map<string, Atom>
  ) {}

  optimizeTypeInference(pattern: Pattern): Pattern {
    const optimized = { ...pattern };

    // Optimize variable type restrictions
    if (pattern.isVariable && pattern.typeRestriction) {
      optimized.typeRestriction = this.optimizeTypeRestriction(pattern.typeRestriction);
    }

    // Optimize outgoing patterns
    if (pattern.outgoing) {
      optimized.outgoing = pattern.outgoing.map(p =>
        typeof p === 'string' ? p : this.optimizeTypeInference(p)
      );
    }

    // Optimize nested patterns
    if (pattern.patterns) {
      optimized.patterns = pattern.patterns.map(p => 
        this.optimizeTypeInference(p)
      );
    }

    return this.applyTypeHeuristics(optimized);
  }

  private optimizeTypeRestriction(restriction: AtomType | AtomType[]): AtomType | AtomType[] {
    if (Array.isArray(restriction)) {
      // Remove redundant types
      const optimizedTypes = this.removeRedundantTypes(restriction);
      return optimizedTypes.length === 1 ? optimizedTypes[0] : optimizedTypes;
    }
    return restriction;
  }

  private removeRedundantTypes(types: AtomType[]): AtomType[] {
    return types.filter((type1, index) =>
      !types.some((type2, otherIndex) =>
        index !== otherIndex && 
        this.hierarchy.isSubtype(type1, type2)
      )
    );
  }

  private applyTypeHeuristics(pattern: Pattern): Pattern {
    const optimized = { ...pattern };

    // Apply common type patterns
    if (this.isEvaluationPattern(optimized)) {
      optimized.type = 'EvaluationLink';
      optimized.typeRestriction = undefined;
    }

    // Optimize based on atom space statistics
    if (optimized.isVariable && !optimized.typeRestriction) {
      optimized.typeRestriction = this.inferTypeFromUsage(optimized);
    }

    return optimized;
  }

  private isEvaluationPattern(pattern: Pattern): boolean {
    return pattern.outgoing?.length === 2 &&
           typeof pattern.outgoing[0] !== 'string' &&
           pattern.outgoing[0].type === 'PredicateNode';
  }

  private inferTypeFromUsage(pattern: Pattern): AtomType | undefined {
    if (!pattern.variableName) return undefined;

    // Analyze atom space for common type patterns
    const typeFrequency = new Map<AtomType, number>();
    
    Array.from(this.atomSpace.values()).forEach(atom => {
      typeFrequency.set(
        atom.type,
        (typeFrequency.get(atom.type) || 0) + 1
      );
    });

    // Return most frequent compatible type
    return Array.from(typeFrequency.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type)[0];
  }
}