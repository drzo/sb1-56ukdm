export interface AgentCapability {
  name: string;
  description: string;
  parameters: Record<string, any>;
  constraints?: Record<string, any>;
  autonomyLevel: number;
  learningRate: number;
  energyCost: number;
  successRate: number;
}

export interface AgentState {
  status: 'idle' | 'working' | 'blocked' | 'completed' | 'learning';
  currentTask?: string;
  collaborators: string[];
  resources: string[];
  memory: Record<string, any>;
  goals: string[];
  beliefs: Map<string, number>;
  intentions: string[];
  plans: string[];
  energy: number;
  performance: AgentPerformance;
}

export interface AgentPerformance {
  successRate: number;
  taskCompletion: number;
  collaborationScore: number;
  learningProgress: number;
}