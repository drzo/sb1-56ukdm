export interface SwarmMetrics {
  agentCount: number;
  activeTaskCount: number;
  completedTaskCount: number;
  averageSuccessRate: number;
  averageCollaborationScore: number;
  totalEnergy: number;
  learningProgress: number;
}

export interface ResourceMetrics {
  energyUtilization: number;
  memoryUtilization: number;
  processingUtilization: number;
}

export interface PerformanceMetrics {
  taskCompletionRate: number;
  averageResponseTime: number;
  errorRate: number;
  adaptationRate: number;
}