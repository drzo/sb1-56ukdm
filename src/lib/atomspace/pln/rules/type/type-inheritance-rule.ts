import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TypeInheritanceRule extends BasePLNRule {
  readonly name = 'TypeInheritance';
  readonly description = 'Infer inheritance relationships between types';
  readonly category = 'Type';
  readonly computationalCost = 0.6;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [subType, superType] = atoms;
    if (!subType.truthValue || !superType.truthValue) return [];

    // Calculate inheritance strength based on type compatibility
    const inheritanceTv: TruthValue = {
      strength: this.calculateInheritanceStrength(subType, superType),
      confidence: Math.min(
        subType.truthValue.confidence,
        superType.truthValue.confidence
      ) * 0.9
    };

    return [this.createResultAtom(
      `type-inh-${subType.id}-${superType.id}`,
      'TypeInheritanceLink',
      `TypeInheritance(${subType.name},${superType.name})`,
      [subType.id, superType.id],
      inheritanceTv
    )];
  }

  private calculateInheritanceStrength(subType: Atom, superType: Atom): number {
    // Check structural compatibility
    if (subType.type === 'TypeNode' && superType.type === 'TypeNode') {
      return 1.0; // Direct type inheritance
    }

    // Check for compatible type constraints
    if (subType.outgoing && superType.outgoing) {
      return this.calculateConstraintCompatibility(subType, superType);
    }

    return 0.5; // Default partial inheritance
  }

  private calculateConstraintCompatibility(subType: Atom, superType: Atom): number {
    const subConstraints = subType.outgoing || [];
    const superConstraints = superType.outgoing || [];

    if (superConstraints.length === 0) return 1.0;
    if (subConstraints.length < superConstraints.length) return 0.0;

    // Check if all super constraints are satisfied by sub constraints
    const matchingConstraints = superConstraints.filter(superC =>
      subConstraints.some(subC => subC === superC)
    );

    return matchingConstraints.length / superConstraints.length;
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => 
             atom.type === 'TypeNode' || 
             atom.type === 'TypeChoiceNode'
           );
  }
}