import { TaskWithStatus } from '../types';
import { Logger } from '../../cogutil/Logger';

export class RewardCalculator {
  calculateReward(task: TaskWithStatus): number {
    try {
      let reward = 0;

      // Base reward for task completion
      if (task.status === 'completed') {
        reward += 1;
      } else if (task.status === 'failed') {
        reward -= 0.5;
      }

      // Adjust for task priority
      reward *= task.priority;

      // Adjust for task complexity
      reward *= (1 + task.complexity);

      // Adjust for energy efficiency
      const energyEfficiency = task.reward / task.energyCost;
      reward *= (1 + Math.min(1, energyEfficiency));

      return Math.max(-1, Math.min(1, reward));
    } catch (error) {
      Logger.error('Failed to calculate reward:', error);
      return 0;
    }
  }

  calculateCollaborationReward(agentCount: number, taskSuccess: boolean): number {
    try {
      let reward = taskSuccess ? 1 : -0.1;
      
      // Scale reward based on number of collaborating agents
      reward *= Math.log2(agentCount + 1) / Math.log2(5);

      return Math.max(-1, Math.min(1, reward));
    } catch (error) {
      Logger.error('Failed to calculate collaboration reward:', error);
      return 0;
    }
  }

  calculateLearningReward(
    oldPerformance: number,
    newPerformance: number
  ): number {
    try {
      const improvement = newPerformance - oldPerformance;
      return Math.max(-1, Math.min(1, improvement));
    } catch (error) {
      Logger.error('Failed to calculate learning reward:', error);
      return 0;
    }
  }
}