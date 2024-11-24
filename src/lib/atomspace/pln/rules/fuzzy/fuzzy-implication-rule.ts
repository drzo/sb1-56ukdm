import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class FuzzyImplicationRule extends BasePLNRule {
  readonly name = 'FuzzyImplication';
  readonly description = 'Compute fuzzy implication using Gödel implication';
  readonly category = 'Fuzzy';
  readonly computationalCost = 0.6;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [antecedent, consequent] = atoms;
    if (!antecedent.truthValue || !consequent.truthValue) return [];

    // Gödel implication: a → b = 1 if a ≤ b, b otherwise
    const implicationStrength = antecedent.truthValue.strength <= consequent.truthValue.strength
      ? 1
      : consequent.truthValue.strength;

    const implicationTv: TruthValue = {
      strength: implicationStrength,
      confidence: Math.min(
        antecedent.truthValue.confidence,
        consequent.truthValue.confidence
      ) * 0.9
    };

    return [this.createResultAtom(
      `fuzzy-imp-${antecedent.id}-${consequent.id}`,
      'FuzzyImplicationLink',
      `FuzzyImplication(${antecedent.name},${consequent.name})`,
      [antecedent.id, consequent.id],
      implicationTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}