import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TypeVarianceRule extends BasePLNRule {
  readonly name = 'TypeVariance';
  readonly description = 'Handle covariant and contravariant type relationships';
  readonly category = 'Type';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [type1, type2, variance] = atoms;
    if (!type1.truthValue || !type2.truthValue || !variance.truthValue) return [];

    const isCovariant = this.isCovariantRelation(variance);
    const varianceTv = isCovariant
      ? this.calculateCovariance(type1, type2)
      : this.calculateContravariance(type1, type2);

    return [this.createResultAtom(
      `type-variance-${type1.id}-${type2.id}`,
      isCovariant ? 'TypeCovariantLink' : 'TypeContravariantLink',
      `TypeVariance(${type1.name},${type2.name})`,
      [type1.id, type2.id],
      varianceTv
    )];
  }

  private isCovariantRelation(variance: Atom): boolean {
    return variance.name.includes('Covariant');
  }

  private calculateCovariance(type1: Atom, type2: Atom): TruthValue {
    const strength = this.calculateVarianceStrength(type1, type2, true);
    return {
      strength,
      confidence: Math.min(
        type1.truthValue!.confidence,
        type2.truthValue!.confidence
      ) * 0.9
    };
  }

  private calculateContravariance(type1: Atom, type2: Atom): TruthValue {
    const strength = this.calculateVarianceStrength(type1, type2, false);
    return {
      strength,
      confidence: Math.min(
        type1.truthValue!.confidence,
        type2.truthValue!.confidence
      ) * 0.9
    };
  }

  private calculateVarianceStrength(
    type1: Atom,
    type2: Atom,
    isCovariant: boolean
  ): number {
    if (!type1.outgoing || !type2.outgoing) {
      return this.calculateSimpleVariance(type1, type2, isCovariant);
    }

    return this.calculateComplexVariance(type1, type2, isCovariant);
  }

  private calculateSimpleVariance(
    type1: Atom,
    type2: Atom,
    isCovariant: boolean
  ): number {
    const typeHierarchy = this.getTypeHierarchy();
    const type1Level = typeHierarchy.get(type1.type) || 0;
    const type2Level = typeHierarchy.get(type2.type) || 0;

    if (isCovariant) {
      return type1Level <= type2Level ? 1.0 : 0.0;
    } else {
      return type1Level >= type2Level ? 1.0 : 0.0;
    }
  }

  private calculateComplexVariance(
    type1: Atom,
    type2: Atom,
    isCovariant: boolean
  ): number {
    const constraints1 = new Set(type1.outgoing);
    const constraints2 = new Set(type2.outgoing);

    if (isCovariant) {
      // For covariance, type1 should have more specific constraints
      return Array.from(constraints1).every(c => constraints2.has(c)) ? 1.0 : 0.0;
    } else {
      // For contravariance, type1 should have more general constraints
      return Array.from(constraints2).every(c => constraints1.has(c)) ? 1.0 : 0.0;
    }
  }

  private getTypeHierarchy(): Map<string, number> {
    const hierarchy = new Map<string, number>();
    
    // Base types
    hierarchy.set('Node', 0);
    hierarchy.set('Link', 0);
    
    // Level 1 types
    ['ConceptNode', 'PredicateNode', 'TypeNode'].forEach(type => 
      hierarchy.set(type, 1)
    );
    
    // Level 2 types
    ['TypeChoiceNode', 'TypedVariableNode'].forEach(type => 
      hierarchy.set(type, 2)
    );

    return hierarchy;
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.slice(0, 2).every(atom => 
             atom.type === 'TypeNode' || 
             atom.type === 'TypeChoiceNode'
           );
  }
}