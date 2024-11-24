import { Atom, AtomType } from '../types';

export interface TypeConstraint {
  type: AtomType | AtomType[];
  variableName?: string;
  isOptional?: boolean;
}

export interface TypeInferenceResult {
  inferredType: AtomType;
  confidence: number;
  constraints: TypeConstraint[];
}

export class TypeInferenceEngine {
  constructor(private atomSpace: Map<string, Atom>) {}

  inferType(atom: Atom): TypeInferenceResult {
    // Direct type inference
    if (atom.type) {
      return {
        inferredType: atom.type,
        confidence: 1,
        constraints: []
      };
    }

    // Infer from outgoing links
    if (atom.outgoing && atom.outgoing.length > 0) {
      return this.inferFromOutgoing(atom);
    }

    // Default to most general type
    return {
      inferredType: 'ConceptNode',
      confidence: 0.5,
      constraints: []
    };
  }

  private inferFromOutgoing(atom: Atom): TypeInferenceResult {
    const outgoingTypes = atom.outgoing
      .map(id => this.atomSpace.get(id))
      .filter((a): a is Atom => a !== undefined)
      .map(a => this.inferType(a));

    // Analyze type patterns
    if (this.isEvaluationPattern(outgoingTypes)) {
      return {
        inferredType: 'EvaluationLink',
        confidence: 0.9,
        constraints: [
          { type: 'PredicateNode', variableName: 'predicate' },
          { type: ['ConceptNode', 'NumberNode'], variableName: 'argument' }
        ]
      };
    }

    if (this.isInheritancePattern(outgoingTypes)) {
      return {
        inferredType: 'InheritanceLink',
        confidence: 0.9,
        constraints: [
          { type: 'ConceptNode', variableName: 'subclass' },
          { type: 'ConceptNode', variableName: 'superclass' }
        ]
      };
    }

    // Default link type
    return {
      inferredType: 'ListLink',
      confidence: 0.7,
      constraints: outgoingTypes.map((t, i) => ({
        type: t.inferredType,
        variableName: `arg${i}`,
        isOptional: false
      }))
    };
  }

  private isEvaluationPattern(types: TypeInferenceResult[]): boolean {
    return types.length >= 2 &&
           types[0].inferredType === 'PredicateNode';
  }

  private isInheritancePattern(types: TypeInferenceResult[]): boolean {
    return types.length === 2 &&
           types.every(t => t.inferredType === 'ConceptNode');
  }

  validateType(atom: Atom, expectedType: AtomType | AtomType[]): boolean {
    const result = this.inferType(atom);
    
    if (Array.isArray(expectedType)) {
      return expectedType.includes(result.inferredType);
    }
    
    return result.inferredType === expectedType;
  }
}