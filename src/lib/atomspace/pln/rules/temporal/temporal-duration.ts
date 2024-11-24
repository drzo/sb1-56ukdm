import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalDurationRule extends BasePLNRule {
  readonly name = 'TemporalDuration';
  readonly description = 'Infer duration of temporal events';
  readonly category = 'Temporal';
  readonly computationalCost = 0.5;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [event, interval] = atoms;
    if (!event.truthValue || !interval.truthValue) return [];

    // Calculate duration confidence
    const durationTv: TruthValue = {
      strength: event.truthValue.strength * 
                Math.exp(-interval.truthValue.strength),
      confidence: Math.min(
        event.truthValue.confidence,
        interval.truthValue.confidence
      ) * 0.85
    };

    return [this.createResultAtom(
      `temporal-duration-${event.id}`,
      'TemporalDurationLink',
      `TemporalDuration(${event.name})`,
      [event.id, interval.id],
      durationTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}