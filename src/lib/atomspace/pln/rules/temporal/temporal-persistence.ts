import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalPersistenceRule extends BasePLNRule {
  readonly name = 'TemporalPersistence';
  readonly description = 'Predict how long a state or condition persists over time';
  readonly category = 'Temporal';
  readonly computationalCost = 0.5;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 2)) return [];
    
    const [state, duration] = atoms;
    if (!state.truthValue || !duration.truthValue) return [];

    // Calculate persistence probability over time
    const persistenceTv: TruthValue = {
      strength: state.truthValue.strength * 
                Math.exp(-duration.truthValue.strength),
      confidence: state.truthValue.confidence * 
                 Math.exp(-duration.truthValue.confidence)
    };

    return [this.createResultAtom(
      `temp-persist-${state.id}`,
      'TemporalPersistenceLink',
      `TemporalPersistence(${state.name})`,
      [state.id, duration.id],
      persistenceTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 2) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}