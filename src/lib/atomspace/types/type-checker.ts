import { Atom, AtomType } from '../types';
import { TypeHierarchy } from './type-hierarchy';
import { TypeInferenceEngine, TypeConstraint } from './type-inference';

export class TypeChecker {
  private hierarchy: TypeHierarchy;
  private inferenceEngine: TypeInferenceEngine;

  constructor(atomSpace: Map<string, Atom>) {
    this.hierarchy = new TypeHierarchy();
    this.inferenceEngine = new TypeInferenceEngine(atomSpace);
  }

  checkType(atom: Atom, expectedType: AtomType | AtomType[]): boolean {
    const inferredType = this.inferenceEngine.inferType(atom);

    if (Array.isArray(expectedType)) {
      return expectedType.some(type =>
        this.hierarchy.isSubtype(inferredType.inferredType, type)
      );
    }

    return this.hierarchy.isSubtype(inferredType.inferredType, expectedType);
  }

  validateConstraints(atom: Atom, constraints: TypeConstraint[]): boolean {
    if (!atom.outgoing) {
      return constraints.length === 0;
    }

    const outgoingAtoms = atom.outgoing
      .map(id => this.atomSpace.get(id))
      .filter((a): a is Atom => a !== undefined);

    if (outgoingAtoms.length < constraints.filter(c => !c.isOptional).length) {
      return false;
    }

    return constraints.every((constraint, i) => {
      if (i >= outgoingAtoms.length) {
        return constraint.isOptional;
      }

      return this.checkType(outgoingAtoms[i], constraint.type);
    });
  }

  getMostSpecificType(atoms: Atom[]): AtomType {
    const types = atoms.map(atom => 
      this.inferenceEngine.inferType(atom).inferredType
    );
    return this.hierarchy.getMostSpecificCommonType(types);
  }

  getCompatibleTypes(type: AtomType): AtomType[] {
    return [
      type,
      ...this.hierarchy.getSubtypes(type),
      ...this.hierarchy.getSupertypes(type)
    ];
  }
}