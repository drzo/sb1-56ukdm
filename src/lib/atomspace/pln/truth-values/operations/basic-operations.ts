import { BaseTruthValue } from '../core/truth-value';

export class BasicTruthValueOperations {
  static revision(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    return tv1.merge(tv2);
  }

  static deduction(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    const strength = tv1.strength * tv2.strength;
    const confidence = tv1.confidence * tv2.confidence * 0.9; // Deduction confidence penalty
    
    return new tv1.constructor(strength, confidence);
  }

  static induction(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    const strength = (tv1.strength * tv2.strength) / 
                    (tv1.strength + tv2.strength - tv1.strength * tv2.strength);
    const confidence = tv1.confidence * tv2.confidence * 0.8; // Induction confidence penalty
    
    return new tv1.constructor(strength, confidence);
  }

  static abduction(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    const strength = Math.sqrt(tv1.strength * tv2.strength);
    const confidence = tv1.confidence * tv2.confidence * 0.7; // Abduction confidence penalty
    
    return new tv1.constructor(strength, confidence);
  }
}