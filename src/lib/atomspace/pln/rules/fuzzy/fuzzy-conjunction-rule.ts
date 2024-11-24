import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class FuzzyConjunctionRule extends BasePLNRule {
  readonly name = 'FuzzyConjunction';
  readonly description = 'Compute fuzzy AND between concepts using t-norm';
  readonly category = 'Fuzzy';
  readonly computationalCost = 0.5;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    // Use minimum t-norm for fuzzy AND
    const conjunctionTv: TruthValue = {
      strength: Math.min(A.truthValue.strength, B.truthValue.strength),
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence)
    };

    return [this.createResultAtom(
      `fuzzy-and-${A.id}-${B.id}`,
      'FuzzyConjunctionLink',
      `FuzzyConjunction(${A.name},${B.name})`,
      [A.id, B.id],
      conjunctionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}