import { Atom, TruthValue } from '../../../types';
import { BasePLNRule } from './base-rule';
import { calculateIntersection, calculateUnion } from '../../truth-values/operations';

export abstract class SimilarityPLNRule extends BasePLNRule {
  readonly category = 'Similarity';

  protected calculateSimilarity(tv1: TruthValue, tv2: TruthValue): TruthValue {
    const intersection = calculateIntersection(tv1, tv2);
    const union = calculateUnion(tv1, tv2);

    return {
      strength: intersection.strength / union.strength,
      confidence: Math.min(intersection.confidence, union.confidence)
    };
  }

  protected validateSimilarityPair(atoms: Atom[]): boolean {
    return this.validateAtoms(atoms, 2);
  }
}