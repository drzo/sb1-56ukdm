import { BaseTruthValue } from '../core/truth-value';

export class TruthValueCalculator {
  static normalize(value: number): number {
    return Math.min(1, Math.max(0, value));
  }

  static calculateRevisionConfidence(c1: number, c2: number, k: number = 1): number {
    return (c1 + c2 - c1 * c2) / (1 + k);
  }

  static calculateRevisionStrength(s1: number, s2: number, c1: number, c2: number): number {
    return (c1 * s1 + c2 * s2) / (c1 + c2);
  }

  static calculateDeductiveStrength(s1: number, s2: number): number {
    return s1 * s2;
  }

  static calculateInductiveStrength(s1: number, s2: number): number {
    return (s1 * s2) / (s1 + s2 - s1 * s2);
  }

  static calculateAbductiveStrength(s1: number, s2: number): number {
    return Math.sqrt(s1 * s2);
  }

  static calculateConfidencePenalty(
    confidence: number,
    penaltyFactor: number
  ): number {
    return confidence * penaltyFactor;
  }

  static combineConfidences(confidences: number[]): number {
    return Math.min(...confidences);
  }
}