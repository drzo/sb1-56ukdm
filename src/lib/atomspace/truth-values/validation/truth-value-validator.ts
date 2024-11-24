import { BaseTruthValue } from '../core/truth-value';

export class TruthValueValidator {
  static validateOperation(tv1: BaseTruthValue, tv2?: BaseTruthValue): boolean {
    if (!this.isValid(tv1)) return false;
    if (tv2 && !this.isValid(tv2)) return false;
    return true;
  }

  static validateRevision(tv1: BaseTruthValue, tv2: BaseTruthValue): boolean {
    return this.validateOperation(tv1, tv2) &&
           tv1.getType() === tv2.getType();
  }

  static validateDeduction(tv1: BaseTruthValue, tv2: BaseTruthValue): boolean {
    return this.validateOperation(tv1, tv2) &&
           tv1.confidence > 0 &&
           tv2.confidence > 0;
  }

  static validateInduction(tv1: BaseTruthValue, tv2: BaseTruthValue): boolean {
    return this.validateOperation(tv1, tv2) &&
           tv1.strength > 0 &&
           tv2.strength > 0;
  }

  static validateAbduction(tv1: BaseTruthValue, tv2: BaseTruthValue): boolean {
    return this.validateOperation(tv1, tv2) &&
           tv1.strength > 0 &&
           tv2.strength > 0;
  }

  private static isValid(tv: BaseTruthValue): boolean {
    return tv.strength >= 0 && tv.strength <= 1 &&
           tv.confidence >= 0 && tv.confidence <= 1;
  }
}