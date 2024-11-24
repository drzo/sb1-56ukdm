import { TruthValue } from '../types/atom';

export function calculateTruthValue(tv1: TruthValue, tv2: TruthValue): TruthValue {
  return {
    strength: (tv1.strength + tv2.strength) / 2,
    confidence: Math.min(tv1.confidence, tv2.confidence)
  };
}