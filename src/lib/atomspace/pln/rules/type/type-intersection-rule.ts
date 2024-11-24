import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TypeIntersectionRule extends BasePLNRule {
  readonly name = 'TypeIntersection';
  readonly description = 'Find common type constraints between types';
  readonly category = 'Type';
  readonly computationalCost = 0.5;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [type1, type2] = atoms;
    if (!type1.truthValue || !type2.truthValue) return [];

    // Calculate intersection strength
    const intersectionTv: TruthValue = {
      strength: this.calculateIntersectionStrength(type1, type2),
      confidence: Math.min(
        type1.truthValue.confidence,
        type2.truthValue.confidence
      )
    };

    return [this.createResultAtom(
      `type-inter-${type1.id}-${type2.id}`,
      'TypeIntersectionLink',
      `TypeIntersection(${type1.name},${type2.name})`,
      [type1.id, type2.id],
      intersectionTv
    )];
  }

  private calculateIntersectionStrength(type1: Atom, type2: Atom): number {
    // For simple types
    if (!type1.outgoing || !type2.outgoing) {
      return type1.type === type2.type ? 1.0 : 0.0;
    }

    // For complex types with constraints
    const sharedConstraints = type1.outgoing.filter(c1 =>
      type2.outgoing!.some(c2 => c1 === c2)
    );

    if (sharedConstraints.length === 0) return 0.0;

    return sharedConstraints.length / 
           Math.min(type1.outgoing.length, type2.outgoing.length);
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => 
             atom.type === 'TypeNode' || 
             atom.type === 'TypeChoiceNode'
           );
  }
}