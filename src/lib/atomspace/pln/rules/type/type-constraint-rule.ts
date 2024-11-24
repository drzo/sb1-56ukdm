import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TypeConstraintRule extends BasePLNRule {
  readonly name = 'TypeConstraint';
  readonly description = 'Apply and validate type constraints';
  readonly category = 'Type';
  readonly computationalCost = 0.6;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [type, constraint] = atoms;
    if (!type.truthValue || !constraint.truthValue) return [];

    // Calculate constraint satisfaction
    const constraintTv: TruthValue = {
      strength: this.calculateConstraintSatisfaction(type, constraint),
      confidence: Math.min(
        type.truthValue.confidence,
        constraint.truthValue.confidence
      ) * 0.9
    };

    return [this.createResultAtom(
      `type-constraint-${type.id}-${constraint.id}`,
      'TypeConstraintLink',
      `TypeConstraint(${type.name},${constraint.name})`,
      [type.id, constraint.id],
      constraintTv
    )];
  }

  private calculateConstraintSatisfaction(type: Atom, constraint: Atom): number {
    // Check direct constraint satisfaction
    if (this.satisfiesDirectConstraint(type, constraint)) {
      return 1.0;
    }

    // Check structural constraints
    if (type.outgoing && constraint.outgoing) {
      return this.calculateStructuralConstraintSatisfaction(type, constraint);
    }

    // Check value constraints if present
    if (constraint.value !== undefined) {
      return this.calculateValueConstraintSatisfaction(type, constraint);
    }

    return 0.0;
  }

  private satisfiesDirectConstraint(type: Atom, constraint: Atom): boolean {
    // Check type compatibility
    if (type.type === constraint.type) return true;

    // Check type hierarchy constraints
    const typeHierarchy: Record<string, string[]> = {
      'Node': ['ConceptNode', 'PredicateNode', 'TypeNode'],
      'Link': ['InheritanceLink', 'EvaluationLink']
    };

    return typeHierarchy[constraint.type]?.includes(type.type) || false;
  }

  private calculateStructuralConstraintSatisfaction(
    type: Atom,
    constraint: Atom
  ): number {
    const typeConstraints = new Set(type.outgoing);
    const requiredConstraints = new Set(constraint.outgoing);

    // Calculate how many required constraints are satisfied
    const satisfiedConstraints = Array.from(requiredConstraints)
      .filter(c => typeConstraints.has(c));

    return satisfiedConstraints.length / requiredConstraints.size;
  }

  private calculateValueConstraintSatisfaction(
    type: Atom,
    constraint: Atom
  ): number {
    if (type.value === undefined) return 0.0;

    switch (typeof constraint.value) {
      case 'number':
        return this.checkNumberConstraint(type.value, constraint.value);
      case 'string':
        return this.checkStringConstraint(type.value, constraint.value);
      case 'boolean':
        return type.value === constraint.value ? 1.0 : 0.0;
      default:
        return 0.0;
    }
  }

  private checkNumberConstraint(value: any, constraint: number): number {
    if (typeof value !== 'number') return 0.0;
    return value === constraint ? 1.0 :
           value <= constraint ? 0.8 :
           0.0;
  }

  private checkStringConstraint(value: any, constraint: string): number {
    if (typeof value !== 'string') return 0.0;
    return value === constraint ? 1.0 :
           value.includes(constraint) ? 0.8 :
           0.0;
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms[0].type === 'TypeNode' &&
           (atoms[1].type === 'TypeNode' || 
            atoms[1].type === 'TypeConstraintNode');
  }
}