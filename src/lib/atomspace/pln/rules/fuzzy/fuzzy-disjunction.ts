import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class FuzzyDisjunctionRule extends BasePLNRule {
  readonly name = 'FuzzyDisjunction';
  readonly description = 'Compute fuzzy OR between concepts using t-conorm';
  readonly category = 'Fuzzy';

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [A, B] = atoms;
    if (!A.truthValue || !B.truthValue) return [];

    // Use maximum t-conorm for fuzzy OR
    const disjunctionTv: TruthValue = {
      strength: Math.max(A.truthValue.strength, B.truthValue.strength),
      confidence: Math.min(A.truthValue.confidence, B.truthValue.confidence)
    };

    return [this.createResultAtom(
      `fuzzy-or-${A.id}-${B.id}`,
      'FuzzyDisjunctionLink',
      `FuzzyDisjunction(${A.name},${B.name})`,
      [A.id, B.id],
      disjunctionTv
    )];
  }
}