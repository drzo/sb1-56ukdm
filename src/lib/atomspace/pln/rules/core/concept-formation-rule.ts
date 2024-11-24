import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class ConceptFormationRule extends BasePLNRule {
  readonly name = 'ConceptFormation';
  readonly description = 'Form new concepts by combining existing ones';
  readonly category = 'Core';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    // Calculate intersection strength
    const intersectionTv: TruthValue = {
      strength: Math.min(A.truthValue.strength, B.truthValue.strength),
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence)
    };

    // Calculate union strength
    const unionTv: TruthValue = {
      strength: Math.max(A.truthValue.strength, B.truthValue.strength),
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence)
    };

    return [
      this.createResultAtom(
        `concept-intersection-${A.id}-${B.id}`,
        'AndLink',
        `ConceptIntersection(${A.name},${B.name})`,
        [A.id, B.id],
        intersectionTv
      ),
      this.createResultAtom(
        `concept-union-${A.id}-${B.id}`,
        'OrLink',
        `ConceptUnion(${A.name},${B.name})`,
        [A.id, B.id],
        unionTv
      )
    ];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}