import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from '../base/base-rule';

export class TemporalPredictionRule extends BasePLNRule {
  readonly name = 'TemporalPrediction';
  readonly description = 'Predict future states based on temporal patterns';
  readonly category = 'Temporal';
  readonly computationalCost = 0.8;

  applyRule(atoms: Atom[]): Atom[] {
    if (!this.validateAtoms(atoms, 3)) return [];
    
    const [currentState, pattern, timeframe] = atoms;
    if (!currentState.truthValue || !pattern.truthValue || !timeframe.truthValue) return [];

    // Calculate prediction confidence based on pattern strength and timeframe
    const predictionTv: TruthValue = {
      strength: currentState.truthValue.strength * pattern.truthValue.strength,
      confidence: Math.min(
        currentState.truthValue.confidence,
        pattern.truthValue.confidence
      ) * Math.exp(-timeframe.truthValue.strength)
    };

    return [this.createResultAtom(
      `temp-pred-${currentState.id}`,
      'TemporalPredictionLink',
      `TemporalPrediction(${currentState.name})`,
      [currentState.id, pattern.id, timeframe.id],
      predictionTv
    )];
  }

  validate(atoms: Atom[]): boolean {
    return super.validateAtoms(atoms, 3) &&
           atoms.every(atom => atom.truthValue !== undefined);
  }
}