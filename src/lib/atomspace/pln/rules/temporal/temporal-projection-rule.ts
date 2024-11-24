import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalProjectionRule extends BasePLNRule {
  readonly name = 'TemporalProjection';
  readonly description = 'Project truth values across time intervals';
  readonly category = 'Temporal';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [state, timeInterval, context] = atoms;
    if (!state.truthValue || !timeInterval.truthValue || !context.truthValue) return [];

    // Calculate temporal decay
    const temporalDecay = Math.exp(-timeInterval.truthValue.strength);
    
    // Project truth value into future/past
    const projectedTv: TruthValue = {
      strength: state.truthValue.strength * temporalDecay,
      confidence: state.truthValue.confidence * 
                 context.truthValue.strength * 
                 temporalDecay * 0.8
    };

    return [this.createResultAtom(
      `temporal-proj-${state.id}-${timeInterval.id}`,
      'TemporalProjectionLink',
      `TemporalProjection(${state.name},${timeInterval.name})`,
      [state.id, timeInterval.id, context.id],
      projectedTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}