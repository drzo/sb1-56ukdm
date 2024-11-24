import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalCausalityRule extends BasePLNRule {
  readonly name = 'TemporalCausality';
  readonly description = 'Infer causal relationships based on temporal patterns';
  readonly category = 'Temporal';
  readonly computationalCost = 0.7;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [cause, effect, context] = atoms;
    if (!cause.truthValue || !effect.truthValue || !context.truthValue) return [];

    // Calculate causality strength considering temporal context
    const causalityTv: TruthValue = {
      strength: cause.truthValue.strength * effect.truthValue.strength * 
                context.truthValue.strength,
      confidence: Math.min(
        cause.truthValue.confidence,
        effect.truthValue.confidence,
        context.truthValue.confidence
      ) * 0.8
    };

    return [this.createResultAtom(
      `temp-cause-${cause.id}-${effect.id}`,
      'TemporalCausalityLink',
      `TemporalCausality(${cause.name},${effect.name})`,
      [cause.id, effect.id, context.id],
      causalityTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}