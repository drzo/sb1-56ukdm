import { Task, ChatHistoryEntry, Skill, WorkflowTrigger, MemoryFunction, TeamActivity, MemorySystem, AssistantInstance } from '../../types';

export interface DatabaseSchema {
  version: number;
  tasks: Task[];
  chatHistory: ChatHistoryEntry[];
  skills: Skill[];
  triggers: WorkflowTrigger[];
  memoryFunctions: MemoryFunction[];
  teamActivities: TeamActivity[];
  memorySystems: MemorySystem[];
  assistantInstances: AssistantInstance[];
}

export interface DatabaseOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  error?: string;
}