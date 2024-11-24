import { TruthValue } from '../../types';

export const validateTruthValue = (tv: TruthValue): boolean => {
  if (typeof tv.strength !== 'number' || typeof tv.confidence !== 'number') {
    return false;
  }

  if (tv.strength < 0 || tv.strength > 1 || tv.confidence < 0 || tv.confidence > 1) {
    return false;
  }

  return true;
};