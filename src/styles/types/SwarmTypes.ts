export enum SwarmNodeType {
  AGENT = 'AgentNode',
  TASK = 'TaskNode',
  GOAL = 'GoalNode',
  SKILL = 'SkillNode',
  MEMORY = 'MemoryNode',
  RESOURCE = 'ResourceNode'
}

export enum SwarmLinkType {
  EXECUTES = 'ExecutesLink',
  REQUIRES = 'RequiresLink',
  ACHIEVES = 'AchievesLink',
  COLLABORATES = 'CollaboratesLink',
  KNOWS = 'KnowsLink',
  USES = 'UsesLink'
}

export type SwarmAtomType = SwarmNodeType | SwarmLinkType;

export interface AgentCapability {
  name: string;
  description: string;
  parameters: Record<string, any>;
  constraints?: Record<string, any>;
  autonomyLevel?: number; // 0-1 scale for autonomous decision making
  learningRate?: number; // 0-1 scale for adaptation speed
}

export interface AgentState {
  status: 'idle' | 'working' | 'blocked' | 'completed';
  currentTask?: string;
  collaborators: string[];
  resources: string[];
  memory: Record<string, any>;
  goals: string[];
  performance: {
    successRate: number;
    taskCompletion: number;
    collaborationScore: number;
  };
}

export interface TaskDefinition {
  id: string;
  description: string;
  requirements: string[];
  dependencies: string[];
  priority: number;
  deadline?: Date;
  autonomyRequired?: number;
  complexity?: number;
  expectedDuration?: number;
}