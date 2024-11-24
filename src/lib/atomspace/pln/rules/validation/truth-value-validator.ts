import { TruthValue } from '../../../types';

export class TruthValueValidator {
  static validate(tv: TruthValue): boolean {
    return this.validateRange(tv.strength) && 
           this.validateRange(tv.confidence);
  }

  static validateRange(value: number): boolean {
    return value >= 0 && value <= 1;
  }

  static validateRevision(tv1: TruthValue, tv2: TruthValue): boolean {
    return this.validate(tv1) && this.validate(tv2);
  }

  static validateDeduction(
    premise1: TruthValue,
    premise2: TruthValue
  ): boolean {
    return this.validate(premise1) && 
           this.validate(premise2) && 
           premise1.confidence > 0 && 
           premise2.confidence > 0;
  }

  static validateInduction(
    subclass: TruthValue,
    superclass: TruthValue
  ): boolean {
    return this.validate(subclass) && 
           this.validate(superclass) && 
           subclass.strength > 0 && 
           superclass.strength > 0;
  }
}