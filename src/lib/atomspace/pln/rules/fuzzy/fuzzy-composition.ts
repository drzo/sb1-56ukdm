import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class FuzzyCompositionRule extends BasePLNRule {
  readonly name = 'FuzzyComposition';
  readonly description = 'Compose fuzzy relations using max-min composition';
  readonly category = 'Fuzzy';

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [R1, R2, context] = atoms;
    if (!R1.truthValue || !R2.truthValue || !context.truthValue) return [];

    // Max-min composition
    const compositionTv: TruthValue = {
      strength: Math.min(
        Math.max(R1.truthValue.strength, R2.truthValue.strength),
        context.truthValue.strength
      ),
      confidence: Math.min(
        R1.truthValue.confidence,
        R2.truthValue.confidence,
        context.truthValue.confidence
      ) * 0.8
    };

    return [this.createResultAtom(
      `fuzzy-comp-${R1.id}-${R2.id}`,
      'FuzzyCompositionLink',
      `FuzzyComposition(${R1.name},${R2.name})`,
      [R1.id, R2.id, context.id],
      compositionTv
    )];
  }
}