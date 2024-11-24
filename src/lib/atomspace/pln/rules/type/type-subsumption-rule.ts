import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TypeSubsumptionRule extends BasePLNRule {
  readonly name = 'TypeSubsumption';
  readonly description = 'Determine if one type subsumes another';
  readonly category = 'Type';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [subType, superType] = atoms;
    if (!subType.truthValue || !superType.truthValue) return [];

    // Calculate subsumption strength
    const subsumptionTv: TruthValue = {
      strength: this.calculateSubsumptionStrength(subType, superType),
      confidence: Math.min(
        subType.truthValue.confidence,
        superType.truthValue.confidence
      ) * 0.85
    };

    return [this.createResultAtom(
      `type-subsume-${subType.id}-${superType.id}`,
      'TypeSubsumptionLink',
      `TypeSubsumption(${subType.name},${superType.name})`,
      [subType.id, superType.id],
      subsumptionTv
    )];
  }

  private calculateSubsumptionStrength(subType: Atom, superType: Atom): number {
    // Check structural subsumption
    if (!subType.outgoing || !superType.outgoing) {
      return this.checkDirectSubsumption(subType, superType);
    }

    // Check constraint subsumption
    return this.checkConstraintSubsumption(subType, superType);
  }

  private checkDirectSubsumption(subType: Atom, superType: Atom): number {
    if (subType.type === superType.type) return 1.0;
    if (this.isSubtypeOf(subType.type, superType.type)) return 0.9;
    return 0.0;
  }

  private checkConstraintSubsumption(subType: Atom, superType: Atom): number {
    const subConstraints = new Set(subType.outgoing);
    const superConstraints = new Set(superType.outgoing);

    // All super constraints must be satisfied by sub constraints
    const satisfiedConstraints = Array.from(superConstraints)
      .filter(c => subConstraints.has(c));

    return satisfiedConstraints.length / superConstraints.size;
  }

  private isSubtypeOf(type1: string, type2: string): boolean {
    // Basic type hierarchy checks
    const typeHierarchy: Record<string, string[]> = {
      'Node': ['ConceptNode', 'PredicateNode', 'TypeNode'],
      'Link': ['InheritanceLink', 'EvaluationLink', 'TypeChoiceLink']
    };

    return typeHierarchy[type2]?.includes(type1) || false;
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => 
             atom.type === 'TypeNode' || 
             atom.type === 'TypeChoiceNode'
           );
  }
}