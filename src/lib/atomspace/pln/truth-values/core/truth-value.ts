import { TruthValue, SimpleTruthValue, CountTruthValue, IndefiniteTruthValue } from '../../../types';

export abstract class BaseTruthValue implements TruthValue {
  constructor(
    public strength: number,
    public confidence: number
  ) {
    this.strength = Math.min(1, Math.max(0, strength));
    this.confidence = Math.min(1, Math.max(0, confidence));
  }

  abstract getType(): string;
  abstract clone(): BaseTruthValue;
  abstract merge(other: BaseTruthValue): BaseTruthValue;
}

export class SimpleTruthValue extends BaseTruthValue implements SimpleTruthValue {
  readonly type = 'simple';

  getType(): string {
    return this.type;
  }

  clone(): SimpleTruthValue {
    return new SimpleTruthValue(this.strength, this.confidence);
  }

  merge(other: BaseTruthValue): SimpleTruthValue {
    const k = 1; // Revision confidence factor
    const c1 = this.confidence;
    const c2 = other.confidence;
    const s1 = this.strength;
    const s2 = other.strength;
    
    const newConfidence = (c1 + c2 - c1 * c2) / (1 + k);
    const newStrength = (c1 * s1 + c2 * s2) / (c1 + c2);
    
    return new SimpleTruthValue(newStrength, newConfidence);
  }
}

export class CountTruthValue extends BaseTruthValue implements CountTruthValue {
  readonly type = 'count';

  constructor(
    strength: number,
    confidence: number,
    public count: number
  ) {
    super(strength, confidence);
  }

  getType(): string {
    return this.type;
  }

  clone(): CountTruthValue {
    return new CountTruthValue(this.strength, this.confidence, this.count);
  }

  merge(other: BaseTruthValue): CountTruthValue {
    if (other instanceof CountTruthValue) {
      const totalCount = this.count + other.count;
      const newStrength = (this.strength * this.count + other.strength * other.count) / totalCount;
      const newConfidence = Math.sqrt(totalCount) / (Math.sqrt(totalCount) + 1);
      
      return new CountTruthValue(newStrength, newConfidence, totalCount);
    }
    
    return this.mergeWithSimple(other);
  }

  private mergeWithSimple(other: BaseTruthValue): CountTruthValue {
    const merged = super.merge(other) as SimpleTruthValue;
    return new CountTruthValue(merged.strength, merged.confidence, this.count);
  }
}

export class IndefiniteTruthValue extends BaseTruthValue implements IndefiniteTruthValue {
  readonly type = 'indefinite';

  constructor(
    strength: number,
    confidence: number,
    public l: number,
    public u: number
  ) {
    super(strength, confidence);
    this.l = Math.max(0, Math.min(strength, l));
    this.u = Math.min(1, Math.max(strength, u));
  }

  getType(): string {
    return this.type;
  }

  clone(): IndefiniteTruthValue {
    return new IndefiniteTruthValue(this.strength, this.confidence, this.l, this.u);
  }

  merge(other: BaseTruthValue): IndefiniteTruthValue {
    if (other instanceof IndefiniteTruthValue) {
      const newL = Math.max(this.l, other.l);
      const newU = Math.min(this.u, other.u);
      const newStrength = (newL + newU) / 2;
      const newConfidence = Math.min(this.confidence, other.confidence);
      
      return new IndefiniteTruthValue(newStrength, newConfidence, newL, newU);
    }
    
    return this.mergeWithSimple(other);
  }

  private mergeWithSimple(other: BaseTruthValue): IndefiniteTruthValue {
    const merged = super.merge(other) as SimpleTruthValue;
    const width = this.u - this.l;
    return new IndefiniteTruthValue(
      merged.strength,
      merged.confidence,
      Math.max(0, merged.strength - width/2),
      Math.min(1, merged.strength + width/2)
    );
  }
}