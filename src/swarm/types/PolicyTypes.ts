export interface SwarmPolicy {
  name: string;
  description: string;
  conditions: Record<string, any>;
  actions: string[];
  priority: number;
  weight: number;
}

export interface PolicyCondition {
  threshold: number;
  operator: '<' | '>' | '=' | '>=' | '<=';
  value?: number;
}