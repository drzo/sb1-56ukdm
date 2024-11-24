import { TruthValue } from '../../types';

export function calculateRevision(tv1: TruthValue, tv2: TruthValue): TruthValue {
  const k = 1; // Revision confidence factor
  const c1 = tv1.confidence;
  const c2 = tv2.confidence;
  const s1 = tv1.strength;
  const s2 = tv2.strength;
  
  const newConfidence = (c1 + c2 - c1 * c2) / (1 + k);
  const newStrength = (c1 * s1 + c2 * s2) / (c1 + c2);
  
  return {
    strength: Math.min(1, Math.max(0, newStrength)),
    confidence: Math.min(1, Math.max(0, newConfidence))
  };
}

export function calculateDeduction(tv1: TruthValue, tv2: TruthValue): TruthValue {
  const strength = tv1.strength * tv2.strength;
  const confidence = tv1.confidence * tv2.confidence * 0.9; // Deduction confidence penalty
  
  return {
    strength: Math.min(1, Math.max(0, strength)),
    confidence: Math.min(1, Math.max(0, confidence))
  };
}

export function calculateInduction(tv1: TruthValue, tv2: TruthValue): TruthValue {
  const strength = (tv1.strength * tv2.strength) / 
                  (tv1.strength + tv2.strength - tv1.strength * tv2.strength);
  const confidence = tv1.confidence * tv2.confidence * 0.8; // Induction confidence penalty
  
  return {
    strength: Math.min(1, Math.max(0, strength)),
    confidence: Math.min(1, Math.max(0, confidence))
  };
}

export function calculateAbduction(tv1: TruthValue, tv2: TruthValue): TruthValue {
  const strength = Math.sqrt(tv1.strength * tv2.strength);
  const confidence = tv1.confidence * tv2.confidence * 0.7; // Abduction confidence penalty
  
  return {
    strength: Math.min(1, Math.max(0, strength)),
    confidence: Math.min(1, Math.max(0, confidence))
  };
}