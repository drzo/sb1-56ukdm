import {
  BaseTruthValue,
  SimpleTruthValue,
  CountTruthValue,
  IndefiniteTruthValue
} from '../core/truth-value';

export class TruthValueFactory {
  static createSimple(strength: number, confidence: number): SimpleTruthValue {
    return new SimpleTruthValue(strength, confidence);
  }

  static createCount(
    strength: number,
    confidence: number,
    count: number
  ): CountTruthValue {
    return new CountTruthValue(strength, confidence, count);
  }

  static createIndefinite(
    strength: number,
    confidence: number,
    l: number,
    u: number
  ): IndefiniteTruthValue {
    return new IndefiniteTruthValue(strength, confidence, l, u);
  }

  static fromObject(obj: any): BaseTruthValue {
    switch (obj.type) {
      case 'simple':
        return this.createSimple(obj.strength, obj.confidence);
      case 'count':
        return this.createCount(obj.strength, obj.confidence, obj.count);
      case 'indefinite':
        return this.createIndefinite(obj.strength, obj.confidence, obj.l, obj.u);
      default:
        return this.createSimple(obj.strength, obj.confidence);
    }
  }
}