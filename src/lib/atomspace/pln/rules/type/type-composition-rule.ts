import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TypeCompositionRule extends BasePLNRule {
  readonly name = 'TypeComposition';
  readonly description = 'Compose new types from existing type relationships';
  readonly category = 'Type';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [type1, type2] = atoms;
    if (!type1.truthValue || !type2.truthValue) return [];

    // Calculate composition strength
    const compositionTv: TruthValue = {
      strength: this.calculateCompositionStrength(type1, type2),
      confidence: Math.min(
        type1.truthValue.confidence,
        type2.truthValue.confidence
      ) * 0.8
    };

    return [this.createResultAtom(
      `type-comp-${type1.id}-${type2.id}`,
      'TypeCompositionLink',
      `TypeComposition(${type1.name},${type2.name})`,
      [type1.id, type2.id],
      compositionTv
    )];
  }

  private calculateCompositionStrength(type1: Atom, type2: Atom): number {
    // Check for compatible type structures
    if (this.areTypesCompatible(type1, type2)) {
      return this.calculateCompatibilityScore(type1, type2);
    }

    return 0.0; // Types cannot be composed
  }

  private areTypesCompatible(type1: Atom, type2: Atom): boolean {
    // Check basic type compatibility
    if (type1.type !== type2.type) return false;

    // Check structural compatibility for complex types
    if (type1.outgoing && type2.outgoing) {
      return type1.outgoing.length === type2.outgoing.length;
    }

    return true;
  }

  private calculateCompatibilityScore(type1: Atom, type2: Atom): number {
    if (!type1.outgoing || !type2.outgoing) return 1.0;

    // Calculate compatibility based on shared constraints
    const sharedConstraints = type1.outgoing.filter(c1 =>
      type2.outgoing!.some(c2 => c1 === c2)
    );

    return sharedConstraints.length / Math.max(type1.outgoing.length, type2.outgoing.length);
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => 
             atom.type === 'TypeNode' || 
             atom.type === 'TypeChoiceNode'
           );
  }
}