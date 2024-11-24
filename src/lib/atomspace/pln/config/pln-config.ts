export interface PLNConfig {
  // Basic parameters
  maxSteps: number;
  minConfidence: number;
  attentionThreshold: number;
  maxInferenceDepth: number;
  truthValueTolerance: number;

  // Rule selection parameters
  maxActiveRules: number;
  rulePriorityWeight: number;
  attentionWeight: number;
  confidenceWeight: number;
  contextWeight: number;

  // Resource management
  maxComputationalCost: number;
  maxMemoryUsage: number;
  timeoutMs: number;
}

export const defaultPLNConfig: PLNConfig = {
  maxSteps: 100,
  minConfidence: 0.3,
  attentionThreshold: 0,
  maxInferenceDepth: 10,
  truthValueTolerance: 0.01,

  maxActiveRules: 5,
  rulePriorityWeight: 0.3,
  attentionWeight: 0.3,
  confidenceWeight: 0.2,
  contextWeight: 0.2,

  maxComputationalCost: 1000,
  maxMemoryUsage: 1000000,
  timeoutMs: 5000
};