export enum SwarmNodeType {
  AGENT = 'AgentNode',
  TASK = 'TaskNode',
  GOAL = 'GoalNode',
  SKILL = 'SkillNode',
  MEMORY = 'MemoryNode',
  RESOURCE = 'ResourceNode',
  BELIEF = 'BeliefNode',
  INTENTION = 'IntentionNode',
  PLAN = 'PlanNode'
}

export enum SwarmLinkType {
  EXECUTES = 'ExecutesLink',
  REQUIRES = 'RequiresLink',
  ACHIEVES = 'AchievesLink',
  COLLABORATES = 'CollaboratesLink',
  KNOWS = 'KnowsLink',
  USES = 'UsesLink',
  BELIEVES = 'BelievesLink',
  INTENDS = 'IntendsLink',
  PLANS = 'PlansLink'
}

export interface AgentCapability {
  name: string;
  description: string;
  parameters: Record<string, any>;
  constraints?: Record<string, any>;
  autonomyLevel: number; // 0-1 scale for autonomous decision making
  learningRate: number; // 0-1 scale for adaptation speed
  energyCost: number; // Energy cost per use
  successRate: number; // Historical success rate
}

export interface AgentState {
  status: 'idle' | 'working' | 'blocked' | 'completed' | 'learning';
  currentTask?: string;
  collaborators: string[];
  resources: string[];
  memory: Record<string, any>;
  goals: string[];
  beliefs: Map<string, number>; // Belief -> Confidence
  intentions: string[];
  plans: string[];
  energy: number;
  performance: {
    successRate: number;
    taskCompletion: number;
    collaborationScore: number;
    learningProgress: number;
  };
}

export interface TaskDefinition {
  id: string;
  description: string;
  requirements: string[];
  dependencies: string[];
  priority: number;
  deadline?: Date;
  autonomyRequired: number;
  complexity: number;
  expectedDuration: number;
  energyCost: number;
  reward: number;
}

export interface SwarmPolicy {
  name: string;
  description: string;
  conditions: Record<string, any>;
  actions: string[];
  priority: number;
  weight: number;
}

export interface SwarmMetrics {
  agentCount: number;
  activeTaskCount: number;
  completedTaskCount: number;
  averageSuccessRate: number;
  averageCollaborationScore: number;
  totalEnergy: number;
  learningProgress: number;
}