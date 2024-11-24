export interface RuleContext {
  // Goal-directed inference
  goal?: {
    targetType: string;
    targetConfidence: number;
  };

  // Inference history
  history?: {
    ruleId: string;
    success: boolean;
    timestamp: number;
  }[];

  // Resource constraints
  resources?: {
    computationalCost: number;
    memoryLimit: number;
  };

  // Temporal constraints
  temporal?: {
    maxAge: number;
    timeWindow: number;
  };

  // Attention focus
  focus?: {
    targetSTI: number;
    minConfidence: number;
  };
}