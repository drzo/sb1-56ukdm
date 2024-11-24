export interface TruthValue {
  strength: number;
  confidence: number;
}

export abstract class Atom {
  protected truthValue: TruthValue;
  protected id: string;
  protected type: string;

  constructor(type: string, id: string, tv: TruthValue = { strength: 1.0, confidence: 1.0 }) {
    this.type = type;
    this.id = id;
    this.truthValue = tv;
  }

  getId(): string {
    return this.id;
  }

  getType(): string {
    return this.type;
  }

  getTruthValue(): TruthValue {
    return { ...this.truthValue };
  }

  setTruthValue(tv: TruthValue): void {
    if (tv.strength < 0 || tv.strength > 1) {
      throw new Error('Truth value strength must be between 0 and 1');
    }
    if (tv.confidence < 0 || tv.confidence > 1) {
      throw new Error('Truth value confidence must be between 0 and 1');
    }
    this.truthValue = { ...tv };
  }
}