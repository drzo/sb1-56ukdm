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