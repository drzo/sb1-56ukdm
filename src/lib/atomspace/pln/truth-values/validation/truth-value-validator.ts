import { BaseTruthValue } from '../core/truth-value';

export class TruthValueValidator {
  static validate(tv: BaseTruthValue): boolean {
    return this.validateRange(tv.strength) && 
           this.validateRange(tv.confidence);
  }

  static validateRange(value: number): boolean {
    return value >= 0 && value <= 1;
  }

  static validateRevision(tv1: BaseTruthValue, tv2: BaseTruthValue): boolean {
    return this.validate(tv1) && this.validate(tv2);
  }

  static validateDeduction(
    premise1: BaseTruthValue,
    premise2: BaseTruthValue
  ): boolean {
    return this.validate(premise1) && 
           this.validate(premise2) && 
           premise1.confidence > 0 && 
           premise2.confidence > 0;
  }

  static validateInduction(
    subclass: BaseTruthValue,
    superclass: BaseTruthValue
  ): boolean {
    return this.validate(subclass) && 
           this.validate(superclass) && 
           subclass.strength > 0 && 
           superclass.strength > 0;
  }

  static validateOperation(tv1: BaseTruthValue, tv2?: BaseTruthValue): boolean {
    if (!this.validate(tv1)) return false;
    if (tv2 && !this.validate(tv2)) return false;
    return true;
  }
}