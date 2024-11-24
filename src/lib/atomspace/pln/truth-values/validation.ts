import { TruthValue } from '../../types';

export function validateTruthValue(tv: TruthValue): boolean {
  if (!tv) return false;
  
  if (typeof tv.strength !== 'number' || typeof tv.confidence !== 'number') {
    return false;
  }

  if (tv.strength < 0 || tv.strength > 1) return false;
  if (tv.confidence < 0 || tv.confidence > 1) return false;

  return true;
}

export function normalizeTruthValue(tv: TruthValue): TruthValue {
  return {
    strength: Math.min(1, Math.max(0, tv.strength)),
    confidence: Math.min(1, Math.max(0, tv.confidence))
  };
}