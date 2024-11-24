import { MemoryNode, MemoryInstance } from './memory';

export type WorkflowTrigger = 
  | 'cron' 
  | 'memory-threshold'
  | 'resonance-peak'
  | 'network-event';

export type WorkflowState =
  | 'sleeping'
  | 'reviewing'
  | 'learning'
  | 'planning'
  | 'socializing'
  | 'creating';

export interface WorkflowSchedule {
  id: string;
  trigger: WorkflowTrigger;
  cronExpression?: string;
  threshold?: number;
  state: WorkflowState;
  lastRun?: number;
  nextRun?: number;
}

export interface WorkflowTask {
  id: string;
  type: 'review' | 'learn' | 'create' | 'socialize';
  status: 'pending' | 'in-progress' | 'completed';
  priority: number;
  context?: {
    memoryIds?: string[];
    projectId?: string;
    networkId?: string;
  };
  metrics?: {
    resonance: number;
    attention: number;
    energy: number;
  };
}

export interface LearningSession {
  id: string;
  startTime: number;
  endTime?: number;
  objectives: string[];
  progress: {
    completed: string[];
    failed: string[];
    insights: string[];
  };
  metrics: {
    resonanceGain: number;
    energySpent: number;
    memoriesFormed: number;
  };
}

export interface NetworkInteraction {
  id: string;
  platform: 'singularitynet' | 'github' | 'discord';
  type: 'discussion' | 'collaboration' | 'creation';
  participants: string[];
  content: string;
  timestamp: number;
  context?: {
    projectId?: string;
    threadId?: string;
    memoryIds?: string[];
  };
}