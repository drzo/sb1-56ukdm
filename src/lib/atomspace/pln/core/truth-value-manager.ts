import { TruthValue } from '../../types';
import { PLNConfig } from '../config/pln-config';
import { TruthValueOperations } from '../truth-values/operations/truth-value-operations';
import { TruthValueValidator } from '../truth-values/validation/truth-value-validator';

export class TruthValueManager {
  private validator: TruthValueValidator;
  private operations: TruthValueOperations;

  constructor(private config: PLNConfig) {
    this.validator = new TruthValueValidator();
    this.operations = new TruthValueOperations();
  }

  mergeTruthValues(tv1: TruthValue, tv2: TruthValue): TruthValue {
    if (!this.validator.validateOperation(tv1, tv2)) {
      throw new Error('Invalid truth values for merge operation');
    }

    return this.operations.revision(tv1, tv2);
  }

  adjustConfidence(tv: TruthValue, factor: number): TruthValue {
    return {
      strength: tv.strength,
      confidence: Math.min(1, tv.confidence * factor)
    };
  }

  isSignificant(tv: TruthValue): boolean {
    return tv.strength * tv.confidence > this.config.minConfidence;
  }

  compareStrength(tv1: TruthValue, tv2: TruthValue): number {
    return tv1.strength - tv2.strength;
  }

  compareConfidence(tv1: TruthValue, tv2: TruthValue): number {
    return tv1.confidence - tv2.confidence;
  }
}