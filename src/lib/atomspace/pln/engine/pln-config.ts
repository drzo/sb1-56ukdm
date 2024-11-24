export interface PLNConfig {
  maxSteps: number;
  minConfidence: number;
  attentionThreshold: number;
  maxInferenceDepth: number;
  truthValueTolerance: number;
}

export const defaultPLNConfig: PLNConfig = {
  maxSteps: 100,
  minConfidence: 0.3,
  attentionThreshold: 0,
  maxInferenceDepth: 10,
  truthValueTolerance: 0.01
};