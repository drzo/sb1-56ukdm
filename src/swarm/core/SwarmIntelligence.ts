import { SwarmAtomSpace } from './SwarmAtomSpace';
import { SwarmMetrics } from '../types';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

export class SwarmIntelligence {
  private swarmSpace: SwarmAtomSpace;
  private metrics: SwarmMetrics;
  private lastUpdateTime: number;

  constructor(swarmSpace: SwarmAtomSpace) {
    this.swarmSpace = swarmSpace;
    this.lastUpdateTime = Date.now();
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): SwarmMetrics {
    return {
      agentCount: 0,
      activeTaskCount: 0,
      completedTaskCount: 0,
      averageSuccessRate: 1.0,
      averageCollaborationScore: 1.0,
      totalEnergy: 0,
      learningProgress: 0
    };
  }

  async updateSwarmState(): Promise<void> {
    const timer = new Timer();
    try {
      // Update metrics
      const agents = this.swarmSpace.getAvailableAgents();
      const tasks = this.swarmSpace.getPendingTasks();
      
      this.metrics = {
        agentCount: agents.length,
        activeTaskCount: tasks.length,
        completedTaskCount: this.metrics.completedTaskCount,
        averageSuccessRate: this.calculateAverageSuccessRate(agents),
        averageCollaborationScore: this.calculateCollaborationScore(agents),
        totalEnergy: this.calculateTotalEnergy(agents),
        learningProgress: this.calculateLearningProgress()
      };

      this.lastUpdateTime = Date.now();
      Logger.debug(`Swarm state updated in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to update swarm state:', error);
      throw error;
    }
  }

  private calculateAverageSuccessRate(agents: any[]): number {
    if (agents.length === 0) return 1.0;
    return agents.reduce((sum, agent) => 
      sum + agent.getState().performance.successRate, 0
    ) / agents.length;
  }

  private calculateCollaborationScore(agents: any[]): number {
    if (agents.length === 0) return 1.0;
    return agents.reduce((sum, agent) =>
      sum + agent.getState().performance.collaborationScore, 0
    ) / agents.length;
  }

  private calculateTotalEnergy(agents: any[]): number {
    return agents.reduce((sum, agent) =>
      sum + agent.getState().energy, 0
    );
  }

  private calculateLearningProgress(): number {
    return 0.5; // Placeholder implementation
  }

  getMetrics(): SwarmMetrics {
    return { ...this.metrics };
  }
}