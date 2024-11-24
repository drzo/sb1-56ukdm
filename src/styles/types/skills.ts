export interface LearningPathStep {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  steps: LearningPathStep[];
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
}

export interface Skill {
  id: string;
  command: string;
  description: string;
  code?: string;
  prompt?: string;
  level: number;
  experience: number;
  experienceRequired: number;
  status: 'learning' | 'practicing' | 'mastered';
  learningPaths: LearningPath[];
  lastPracticed?: string;
  assistantAnalysis?: string;
  created_at: string;
  updated_at: string;
}