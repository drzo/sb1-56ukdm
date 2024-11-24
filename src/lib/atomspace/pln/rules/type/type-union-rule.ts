import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TypeUnionRule extends BasePLNRule {
  readonly name = 'TypeUnion';
  readonly description = 'Create union types from existing types';
  readonly category = 'Type';
  readonly computationalCost = 0.6;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [type1, type2] = atoms;
    if (!type1.truthValue || !type2.truthValue) return [];

    // Calculate union strength
    const unionTv: TruthValue = {
      strength: this.calculateUnionStrength(type1, type2),
      confidence: Math.min(
        type1.truthValue.confidence,
        type2.truthValue.confidence
      ) * 0.9
    };

    return [this.createResultAtom(
      `type-union-${type1.id}-${type2.id}`,
      'TypeChoiceLink',
      `TypeUnion(${type1.name},${type2.name})`,
      [type1.id, type2.id],
      unionTv
    )];
  }

  private calculateUnionStrength(type1: Atom, type2: Atom): number {
    // For simple types
    if (!type1.outgoing || !type2.outgoing) {
      return type1.type === type2.type ? 1.0 : 0.8;
    }

    // For complex types, calculate union coverage
    const allConstraints = new Set([
      ...(type1.outgoing || []),
      ...(type2.outgoing || [])
    ]);

    return Math.min(1.0, allConstraints.size / 
      Math.max(type1.outgoing.length, type2.outgoing.length));
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => 
             atom.type === 'TypeNode' || 
             atom.type === 'TypeChoiceNode'
           );
  }
}