import { BaseTruthValue } from '../core/truth-value';
import { TruthValueValidator } from '../validation/truth-value-validator';

export class TruthValueOperations {
  static revision(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    TruthValueValidator.validateRevision(tv1, tv2);
    return tv1.merge(tv2);
  }

  static deduction(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    TruthValueValidator.validateDeduction(tv1, tv2);
    
    const strength = tv1.strength * tv2.strength;
    const confidence = tv1.confidence * tv2.confidence * 0.9; // Deduction confidence penalty
    
    return tv1.clone().constructor(strength, confidence);
  }

  static induction(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    TruthValueValidator.validateInduction(tv1, tv2);
    
    const strength = (tv1.strength * tv2.strength) / 
                    (tv1.strength + tv2.strength - tv1.strength * tv2.strength);
    const confidence = tv1.confidence * tv2.confidence * 0.8; // Induction confidence penalty
    
    return tv1.clone().constructor(strength, confidence);
  }

  static abduction(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    TruthValueValidator.validateAbduction(tv1, tv2);
    
    const strength = Math.sqrt(tv1.strength * tv2.strength);
    const confidence = tv1.confidence * tv2.confidence * 0.7; // Abduction confidence penalty
    
    return tv1.clone().constructor(strength, confidence);
  }

  static intersection(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    TruthValueValidator.validateOperation(tv1, tv2);
    
    const strength = Math.min(tv1.strength, tv2.strength);
    const confidence = Math.min(tv1.confidence, tv2.confidence);
    
    return tv1.clone().constructor(strength, confidence);
  }

  static union(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    TruthValueValidator.validateOperation(tv1, tv2);
    
    const strength = Math.max(tv1.strength, tv2.strength);
    const confidence = Math.min(tv1.confidence, tv2.confidence);
    
    return tv1.clone().constructor(strength, confidence);
  }

  static complement(tv: BaseTruthValue): BaseTruthValue {
    TruthValueValidator.validateOperation(tv);
    
    return tv.clone().constructor(1 - tv.strength, tv.confidence);
  }
}