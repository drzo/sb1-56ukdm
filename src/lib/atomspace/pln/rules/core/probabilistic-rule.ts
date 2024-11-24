import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class ProbabilisticRule extends BasePLNRule {
  readonly name = 'Probabilistic';
  readonly description = 'Handle probabilistic inference with uncertainty';
  readonly category = 'Core';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [event1, event2] = atoms;
    if (!event1.truthValue || !event2.truthValue) return [];

    // Calculate conditional probability
    const jointProb = this.calculateJointProbability(event1, event2);
    const conditionalProb = this.calculateConditionalProbability(event1, event2);

    const probabilisticTv: TruthValue = {
      strength: conditionalProb,
      confidence: Math.min(
        event1.truthValue.confidence,
        event2.truthValue.confidence
      ) * jointProb
    };

    return [this.createResultAtom(
      `prob-${event1.id}-${event2.id}`,
      'ProbabilisticLink',
      `Probabilistic(${event1.name},${event2.name})`,
      [event1.id, event2.id],
      probabilisticTv
    )];
  }

  private calculateJointProbability(event1: Atom, event2: Atom): number {
    return event1.truthValue!.strength * event2.truthValue!.strength;
  }

  private calculateConditionalProbability(event1: Atom, event2: Atom): number {
    const jointProb = this.calculateJointProbability(event1, event2);
    return jointProb / Math.max(0.0001, event1.truthValue!.strength);
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => 
             atom.truthValue !== undefined &&
             atom.truthValue.strength >= 0 &&
             atom.truthValue.strength <= 1
           );
  }
}