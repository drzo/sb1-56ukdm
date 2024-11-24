import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from './base-rule';
import { calculateDeduction } from '../../truth-values/operations';

export abstract class DeductivePLNRule extends BasePLNRule {
  readonly category = 'Deductive';

  protected calculateDeductiveStrength(
    premise1: TruthValue,
    premise2: TruthValue,
    confidencePenalty: number = 0.9
  ): TruthValue {
    const strength = premise1.strength * premise2.strength;
    const confidence = premise1.confidence * premise2.confidence * confidencePenalty;

    return {
      strength: Math.min(1, Math.max(0, strength)),
      confidence: Math.min(1, Math.max(0, confidence))
    };
  }

  protected validateDeductiveChain(atoms: Atom[]): boolean {
    if (!this.validateAtoms(atoms, 3)) return false;

    const [A, B, C] = atoms;
    if (!A.outgoing?.includes(B.id) || !B.outgoing?.includes(C.id)) {
      return false;
    }

    return true;
  }
}