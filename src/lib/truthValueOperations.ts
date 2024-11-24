import { TruthValue } from './types';

export const calculateRevision = (tv1: TruthValue, tv2: TruthValue): TruthValue => {
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
};

export const calculateDeduction = (tv1: TruthValue, tv2: TruthValue): TruthValue => {
  const strength = tv1.strength * tv2.strength;
  const confidence = tv1.confidence * tv2.confidence;
  
  return {
    strength: Math.min(1, Math.max(0, strength)),
    confidence: Math.min(1, Math.max(0, confidence))
  };
};

export const calculateIntersection = (tv1: TruthValue, tv2: TruthValue): TruthValue => {
  const strength = Math.min(tv1.strength, tv2.strength);
  const confidence = Math.min(tv1.confidence, tv2.confidence);
  
  return { strength, confidence };
};

export const calculateUnion = (tv1: TruthValue, tv2: TruthValue): TruthValue => {
  const strength = Math.max(tv1.strength, tv2.strength);
  const confidence = Math.min(tv1.confidence, tv2.confidence);
  
  return { strength, confidence };
};