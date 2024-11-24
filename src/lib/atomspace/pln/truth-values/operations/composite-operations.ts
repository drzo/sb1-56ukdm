import { BaseTruthValue } from '../core/truth-value';

export class CompositeTruthValueOperations {
  static intersection(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    const strength = Math.min(tv1.strength, tv2.strength);
    const confidence = Math.min(tv1.confidence, tv2.confidence);
    
    return new tv1.constructor(strength, confidence);
  }

  static union(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    const strength = Math.max(tv1.strength, tv2.strength);
    const confidence = Math.min(tv1.confidence, tv2.confidence);
    
    return new tv1.constructor(strength, confidence);
  }

  static complement(tv: BaseTruthValue): BaseTruthValue {
    return new tv.constructor(1 - tv.strength, tv.confidence);
  }

  static intensionalInheritance(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    const strength = tv1.strength * (1 - Math.abs(tv1.strength - tv2.strength));
    const confidence = Math.min(tv1.confidence, tv2.confidence) * 0.9;
    
    return new tv1.constructor(strength, confidence);
  }

  static extensionalInheritance(tv1: BaseTruthValue, tv2: BaseTruthValue): BaseTruthValue {
    const strength = Math.min(1, tv1.strength / Math.max(0.0001, tv2.strength));
    const confidence = Math.min(tv1.confidence, tv2.confidence) * 0.9;
    
    return new tv1.constructor(strength, confidence);
  }
}