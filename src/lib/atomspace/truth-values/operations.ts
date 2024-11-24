import { TruthValue, CompositeTruthValue } from '../../types/truth-values';

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
  const confidence = tv1.confidence * tv2.confidence * 0.9; // Deduction confidence penalty
  
  return {
    strength: Math.min(1, Math.max(0, strength)),
    confidence: Math.min(1, Math.max(0, confidence))
  };
};

export const calculateInduction = (tv1: TruthValue, tv2: TruthValue): TruthValue => {
  const strength = (tv1.strength * tv2.strength) / (tv1.strength + tv2.strength - tv1.strength * tv2.strength);
  const confidence = tv1.confidence * tv2.confidence * 0.8; // Induction confidence penalty
  
  return {
    strength: Math.min(1, Math.max(0, strength)),
    confidence: Math.min(1, Math.max(0, confidence))
  };
};

export const calculateAbduction = (tv1: TruthValue, tv2: TruthValue): TruthValue => {
  const strength = Math.sqrt(tv1.strength * tv2.strength);
  const confidence = tv1.confidence * tv2.confidence * 0.7; // Abduction confidence penalty
  
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

export const calculateComplement = (tv: TruthValue): TruthValue => {
  return {
    strength: 1 - tv.strength,
    confidence: tv.confidence
  };
};

export const mergeCompositeTruthValues = (
  ctv1: CompositeTruthValue,
  ctv2: CompositeTruthValue
): CompositeTruthValue => {
  const primary = calculateRevision(ctv1.primary, ctv2.primary);
  
  const hypothetical = ctv1.hypothetical && ctv2.hypothetical
    ? calculateRevision(ctv1.hypothetical, ctv2.hypothetical)
    : ctv1.hypothetical || ctv2.hypothetical;

  const contextual = new Map<string, TruthValue>();
  
  // Merge contextual truth values
  if (ctv1.contextual) {
    for (const [context, tv] of ctv1.contextual) {
      contextual.set(context, tv);
    }
  }
  
  if (ctv2.contextual) {
    for (const [context, tv] of ctv2.contextual) {
      const existing = contextual.get(context);
      contextual.set(context, existing ? calculateRevision(existing, tv) : tv);
    }
  }

  return {
    primary,
    hypothetical,
    contextual: contextual.size > 0 ? contextual : undefined
  };
};