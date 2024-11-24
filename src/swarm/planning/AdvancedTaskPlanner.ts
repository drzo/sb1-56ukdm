import { TaskPlanner } from './TaskPlanner';
import { TaskWithStatus, AgentCapability } from '../types';
import { SwarmAgent } from '../SwarmAgent';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';

interface PlanningMetrics {
  efficiency: number;
  resourceUtilization: number;
  loadBalance: number;
  completionRate: number;
}

export class AdvancedTaskPlanner extends TaskPlanner {
  private planningModel: tf.LayersModel | null = null;
  private readonly historySize = 1000;
  private planningHistory: {
    assignments: Map<string, string[]>;
    metrics: PlanningMetrics;
  }[] = [];

  constructor() {
    super();
    this.initializePlanningModel();
  }

  private async initializePlanningModel(): Promise<void> {
    try {
      const model = tf.sequential();
      
      // Input layer for agent and task features
      model.add(tf.layers.dense({
        units: 128,
        activation: 'relu',
        inputShape: [64]
      }));
      
      // Hidden layers
      model.add(tf.layers.dense({
        units: 64,
        activation: 'relu'
      }));
      
      model.add(tf.layers.dropout({ rate: 0.2 }));
      
      // Output layer for assignment probability
      model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid'
      }));

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      this.planningModel = model;
      Logger.info('Planning model initialized');
    } catch (error) {
      Logger.error('Failed to initialize planning model:', error);
      throw error;
    }
  }

  async planTasks(
    tasks: TaskWithStatus[],
    agents: SwarmAgent[]
  ): Promise<Map<string, string[]>> {
    const timer = new Timer();
    try {
      // Sort tasks by priority and dependencies
      const sortedTasks = this.sortTasksByPriority(tasks);

      // Create initial assignments using base planner
      const baseAssignments = await super.planTasks(tasks, agents);

      // Optimize assignments using ML model
      const optimizedAssignments = await this.optimizeAssignments(
        sortedTasks,
        agents,
        baseAssignments
      );

      // Calculate and store metrics
      const metrics = this.calculatePlanningMetrics(
        optimizedAssignments,
        tasks,
        agents
      );
      
      this.storePlanningHistory(optimizedAssignments, metrics);

      Logger.info(`Advanced task planning completed in ${timer.stop()}ms`);
      return optimizedAssignments;
    } catch (error) {
      Logger.error('Advanced task planning failed:', error);
      throw error;
    }
  }

  private sortTasksByPriority(tasks: TaskWithStatus[]): TaskWithStatus[] {
    return [...tasks].sort((a, b) => {
      // Consider multiple factors for priority
      const priorityScore = (task: TaskWithStatus) => {
        return (
          task.priority * 0.4 +  // Base priority
          (task.reward / task.energyCost) * 0.3 +  // Efficiency
          (1 / (task.dependencies.length + 1)) * 0.3  // Dependency complexity
        );
      };
      
      return priorityScore(b) - priorityScore(a);
    });
  }

  private async optimizeAssignments(
    tasks: TaskWithStatus[],
    agents: SwarmAgent[],
    baseAssignments: Map<string, string[]>
  ): Promise<Map<string, string[]>> {
    if (!this.planningModel) {
      return baseAssignments;
    }

    const optimizedAssignments = new Map(baseAssignments);

    for (const task of tasks) {
      const candidateAgents = this.findCandidateAgents(task, agents);
      
      if (candidateAgents.length === 0) continue;

      const bestAgents = await this.selectOptimalAgents(
        task,
        candidateAgents
      );

      optimizedAssignments.set(task.id, bestAgents.map(a => a.getId()));
    }

    return optimizedAssignments;
  }

  private findCandidateAgents(
    task: TaskWithStatus,
    agents: SwarmAgent[]
  ): SwarmAgent[] {
    return agents.filter(agent => {
      // Check basic requirements
      const meetsRequirements = task.requirements.every(req =>
        agent.hasCapability(req)
      );

      // Check energy requirements
      const hasEnergy = agent.getState().energy >= task.energyCost;

      // Check autonomy level
      const meetsAutonomy = agent.getCapabilities().some(cap =>
        cap.autonomyLevel >= task.autonomyRequired
      );

      // Check current workload
      const workload = this.calculateAgentWorkload(agent);
      const canTakeMoreTasks = workload < 0.8; // 80% capacity

      return meetsRequirements && 
             hasEnergy && 
             meetsAutonomy && 
             canTakeMoreTasks;
    });
  }

  private async selectOptimalAgents(
    task: TaskWithStatus,
    candidates: SwarmAgent[]
  ): Promise<SwarmAgent[]> {
    const agentScores = await Promise.all(
      candidates.map(async agent => {
        const score = await this.predictAssignmentScore(task, agent);
        return { agent, score };
      })
    );

    // Sort by score and select the best agents
    const sortedAgents = agentScores
      .sort((a, b) => b.score - a.score)
      .map(as => as.agent);

    // Determine optimal number of agents
    const optimalCount = this.calculateOptimalAgentCount(task);
    return sortedAgents.slice(0, optimalCount);
  }

  private async predictAssignmentScore(
    task: TaskWithStatus,
    agent: SwarmAgent
  ): Promise<number> {
    if (!this.planningModel) return 0;

    try {
      // Prepare input features
      const features = this.extractFeatures(task, agent);
      const inputTensor = tf.tensor2d([features]);

      // Get prediction
      const prediction = this.planningModel.predict(inputTensor) as tf.Tensor;
      const score = (await prediction.data())[0];

      // Cleanup
      inputTensor.dispose();
      prediction.dispose();

      return score;
    } catch (error) {
      Logger.error('Failed to predict assignment score:', error);
      return 0;
    }
  }

  private extractFeatures(task: TaskWithStatus, agent: SwarmAgent): number[] {
    const features = [];

    // Task features
    features.push(
      task.priority,
      task.complexity,
      task.autonomyRequired,
      task.energyCost / 100,
      task.reward / 100
    );

    // Agent features
    const state = agent.getState();
    features.push(
      state.energy / 100,
      state.performance.successRate,
      state.performance.taskCompletion,
      state.performance.collaborationScore,
      state.performance.learningProgress
    );

    // Capability match features
    const capabilities = agent.getCapabilities();
    task.requirements.forEach(req => {
      const capability = capabilities.find(cap => cap.name === req);
      features.push(capability ? capability.successRate : 0);
    });

    // Pad to fixed length
    while (features.length < 64) {
      features.push(0);
    }

    return features.slice(0, 64);
  }

  private calculateOptimalAgentCount(task: TaskWithStatus): number {
    // Base count on task complexity
    const baseCount = Math.ceil(task.complexity * 3);
    
    // Adjust for energy requirements
    const energyFactor = task.energyCost / 100;
    
    // Adjust for autonomy requirements
    const autonomyFactor = 1 + (1 - task.autonomyRequired);

    return Math.max(1, Math.min(5, Math.round(
      baseCount * energyFactor * autonomyFactor
    )));
  }

  private calculateAgentWorkload(agent: SwarmAgent): number {
    const state = agent.getState();
    const maxEnergy = 100;
    const currentTasks = state.currentTask ? 1 : 0;
    const energyUsage = (maxEnergy - state.energy) / maxEnergy;

    return (currentTasks * 0.5) + (energyUsage * 0.5);
  }

  private calculatePlanningMetrics(
    assignments: Map<string, string[]>,
    tasks: TaskWithStatus[],
    agents: SwarmAgent[]
  ): PlanningMetrics {
    // Calculate efficiency
    const efficiency = Array.from(assignments.entries()).reduce(
      (sum, [taskId, agentIds]) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return sum;

        const assignedAgents = agentIds
          .map(id => agents.find(a => a.getId() === id))
          .filter((a): a is SwarmAgent => a !== undefined);

        const taskEfficiency = this.calculateTaskEfficiency(task, assignedAgents);
        return sum + taskEfficiency;
      },
      0
    ) / Math.max(1, assignments.size);

    // Calculate resource utilization
    const resourceUtilization = agents.reduce(
      (sum, agent) => sum + this.calculateAgentWorkload(agent),
      0
    ) / agents.length;

    // Calculate load balance
    const agentLoads = agents.map(a => this.calculateAgentWorkload(a));
    const loadBalance = 1 - (
      Math.max(...agentLoads) - Math.min(...agentLoads)
    );

    // Calculate completion rate
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = completedTasks / Math.max(1, tasks.length);

    return {
      efficiency,
      resourceUtilization,
      loadBalance,
      completionRate
    };
  }

  private calculateTaskEfficiency(
    task: TaskWithStatus,
    agents: SwarmAgent[]
  ): number {
    const capabilityMatch = agents.reduce((sum, agent) => {
      const matchingCaps = task.requirements.filter(req =>
        agent.hasCapability(req)
      );
      return sum + (matchingCaps.length / task.requirements.length);
    }, 0) / Math.max(1, agents.length);

    const energyEfficiency = 1 - (
      agents.reduce((sum, a) => sum + a.getState().energy, 0) /
      (agents.length * 100)
    );

    return (capabilityMatch + energyEfficiency) / 2;
  }

  private storePlanningHistory(
    assignments: Map<string, string[]>,
    metrics: PlanningMetrics
  ): void {
    this.planningHistory.push({ assignments, metrics });
    if (this.planningHistory.length > this.historySize) {
      this.planningHistory.shift();
    }
  }

  getPlanningMetrics(): PlanningMetrics[] {
    return this.planningHistory.map(h => h.metrics);
  }

  async trainPlanningModel(): Promise<void> {
    if (!this.planningModel || this.planningHistory.length < 10) {
      return;
    }

    try {
      const trainingData = this.prepareTrainingData();
      
      await this.planningModel.fit(
        trainingData.inputs,
        trainingData.outputs,
        {
          epochs: 10,
          batchSize: 32,
          shuffle: true,
          validationSplit: 0.2
        }
      );

      Logger.info('Planning model training completed');
    } catch (error) {
      Logger.error('Failed to train planning model:', error);
    }
  }

  private prepareTrainingData(): {
    inputs: tf.Tensor2D;
    outputs: tf.Tensor2D;
  } {
    const inputs: number[][] = [];
    const outputs: number[] = [];

    this.planningHistory.forEach(history => {
      const success = history.metrics.efficiency > 0.7 &&
                     history.metrics.completionRate > 0.8;
      
      history.assignments.forEach((agentIds, taskId) => {
        agentIds.forEach(agentId => {
          const features = [
            history.metrics.efficiency,
            history.metrics.resourceUtilization,
            history.metrics.loadBalance,
            history.metrics.completionRate
          ];
          
          // Pad features
          while (features.length < 64) {
            features.push(0);
          }

          inputs.push(features);
          outputs.push(success ? 1 : 0);
        });
      });
    });

    return {
      inputs: tf.tensor2d(inputs),
      outputs: tf.tensor2d(outputs, [outputs.length, 1])
    };
  }

  dispose(): void {
    super.clear();
    if (this.planningModel) {
      this.planningModel.dispose();
      this.planningModel = null;
    }
    this.planningHistory = [];
  }
}