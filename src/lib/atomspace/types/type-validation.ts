import { Atom, AtomType, Pattern } from '../types';
import { TypeHierarchy } from './type-hierarchy';

export class TypeValidator {
  constructor(private hierarchy: TypeHierarchy) {}

  validateTypeConstraints(atom: Atom, pattern: Pattern): boolean {
    // Check direct type constraints
    if (pattern.type && !this.validateType(atom.type, pattern.type)) {
      return false;
    }

    // Check type restrictions for variables
    if (pattern.isVariable && pattern.typeRestriction) {
      if (!this.validateTypeRestriction(atom.type, pattern.typeRestriction)) {
        return false;
      }
    }

    // Check outgoing link type constraints
    if (pattern.outgoing && atom.outgoing) {
      return this.validateOutgoingTypes(atom, pattern);
    }

    return true;
  }

  private validateType(atomType: AtomType, patternType: AtomType): boolean {
    return this.hierarchy.isSubtype(atomType, patternType);
  }

  private validateTypeRestriction(
    atomType: AtomType,
    restriction: AtomType | AtomType[]
  ): boolean {
    if (Array.isArray(restriction)) {
      return restriction.some(type => this.validateType(atomType, type));
    }
    return this.validateType(atomType, restriction);
  }

  private validateOutgoingTypes(atom: Atom, pattern: Pattern): boolean {
    if (!pattern.outgoing || !atom.outgoing) return true;
    if (pattern.outgoing.length !== atom.outgoing.length) return false;

    return pattern.outgoing.every((outPattern, index) => {
      if (typeof outPattern === 'string') return true;
      const outAtom = atom.outgoing![index];
      return this.validateTypeConstraints(
        { id: outAtom, type: 'Node' } as Atom,
        outPattern
      );
    });
  }
}