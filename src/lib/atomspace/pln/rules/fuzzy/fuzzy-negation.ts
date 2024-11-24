import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class FuzzyNegationRule extends BasePLNRule {
  readonly name = 'FuzzyNegation';
  readonly description = 'Compute fuzzy NOT using standard negation';
  readonly category = 'Fuzzy';

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 1)) return [];
    
    const [A] = atoms;
    if (!A.truthValue) return [];

    // Standard fuzzy negation
    const negationTv: TruthValue = {
      strength: 1 - A.truthValue.strength,
      confidence: A.truthValue.confidence
    };

    return [this.createResultAtom(
      `fuzzy-not-${A.id}`,
      'FuzzyNegationLink',
      `FuzzyNegation(${A.name})`,
      [A.id],
      negationTv
    )];
  }
}