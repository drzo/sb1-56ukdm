import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class ContextualConjunctionRule extends BasePLNRule {
  readonly name = 'ContextualConjunction';
  readonly description = 'Compute conjunction of concepts within a specific context';
  readonly category = 'Contextual';
  readonly computationalCost = 0.6;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [A, B, context] = atoms;
    if (!A.truthValue || !B.truthValue || !context.truthValue) return [];

    // Calculate conjunction strength with context influence
    const baseStrength = Math.min(A.truthValue.strength, B.truthValue.strength);
    const contextualFactor = context.truthValue.strength;

    const conjunctionTv: TruthValue = {
      strength: baseStrength * contextualFactor,
      confidence: Math.min(
        A.truthValue.confidence,
        B.truthValue.confidence,
        context.truthValue.confidence
      ) * 0.9
    };

    return [this.createResultAtom(
      `ctx-conj-${A.id}-${B.id}`,
      'ContextualAndLink',
      `ContextualConjunction(${A.name},${B.name})`,
      [A.id, B.id, context.id],
      conjunctionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}