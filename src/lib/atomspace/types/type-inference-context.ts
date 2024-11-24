import { Atom, AtomType, Pattern } from '../types';
import { TypeHierarchy } from './type-hierarchy';

export interface TypeContext {
  inferredTypes: Map<string, AtomType>;
  typeConstraints: Map<string, AtomType[]>;
}

export class TypeInferenceContext {
  private context: TypeContext = {
    inferredTypes: new Map(),
    typeConstraints: new Map()
  };

  constructor(private hierarchy: TypeHierarchy) {}

  addInferredType(variableName: string, type: AtomType): void {
    const existing = this.context.inferredTypes.get(variableName);
    if (existing) {
      // Find most specific common type
      const commonType = this.hierarchy.getMostSpecificCommonType([existing, type]);
      this.context.inferredTypes.set(variableName, commonType);
    } else {
      this.context.inferredTypes.set(variableName, type);
    }
  }

  addTypeConstraint(variableName: string, type: AtomType): void {
    const constraints = this.context.typeConstraints.get(variableName) || [];
    if (!constraints.includes(type)) {
      constraints.push(type);
      this.context.typeConstraints.set(variableName, constraints);
    }
  }

  getInferredType(variableName: string): AtomType | undefined {
    return this.context.inferredTypes.get(variableName);
  }

  getTypeConstraints(variableName: string): AtomType[] {
    return this.context.typeConstraints.get(variableName) || [];
  }

  validateTypeConsistency(variableName: string): boolean {
    const inferredType = this.getInferredType(variableName);
    if (!inferredType) return true;

    const constraints = this.getTypeConstraints(variableName);
    return constraints.every(constraint =>
      this.hierarchy.isSubtype(inferredType, constraint)
    );
  }

  clone(): TypeInferenceContext {
    const cloned = new TypeInferenceContext(this.hierarchy);
    cloned.context = {
      inferredTypes: new Map(this.context.inferredTypes),
      typeConstraints: new Map(this.context.typeConstraints)
    };
    return cloned;
  }
}