import { TaskWithStatus, AgentCapability } from '../types';
import { SwarmAgent } from '../SwarmAgent';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import { TaskGraph } from './TaskGraph';
import { ResourceAllocator } from './ResourceAllocator';
import { PriorityQueue } from './PriorityQueue';

export class TaskPlanner {
  private taskGraph: TaskGraph;
  private resourceAllocator: ResourceAllocator;
  private taskQueue: PriorityQueue<TaskWithStatus>;

  constructor() {
    this.taskGraph = new TaskGraph();
    this.resourceAllocator = new ResourceAllocator();
    this.taskQueue = new PriorityQueue<TaskWithStatus>((a, b) => 
      (b.priority + b.reward/100) - (a.priority + a.reward/100)
    );
    Logger.info('TaskPlanner initialized');
  }

  async planTasks(
    tasks: TaskWithStatus[],
    agents: SwarmAgent[]
  ): Promise<Map<string, string[]>> {
    const timer = new Timer();
    try {
      // Build task dependency graph
      this.buildTaskGraph(tasks);

      // Sort tasks by priority and dependencies
      const sortedTasks = this.sortTasks(tasks);

      // Allocate resources and assign agents
      const assignments = await this.assignTasks(sortedTasks, agents);

      Logger.info(`Task planning completed in ${timer.stop()}ms`);
      return assignments;
    } catch (error) {
      Logger.error('Task planning failed:', error);
      throw error;
    }
  }

  private buildTaskGraph(tasks: TaskWithStatus[]): void {
    this.taskGraph.clear();
    
    // Add tasks to graph
    tasks.forEach(task => {
      this.taskGraph.addTask(task);
      this.taskQueue.enqueue(task);
    });

    // Add dependencies
    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        const dependency = tasks.find(t => t.id === depId);
        if (dependency) {
          this.taskGraph.addDependency(dependency, task);
        }
      });
    });
  }

  private sortTasks(tasks: TaskWithStatus[]): TaskWithStatus[] {
    // Topological sort based on dependencies
    const sorted = this.taskGraph.getTopologicalSort();
    
    // Further sort by priority within dependency constraints
    return sorted.map(taskId => 
      tasks.find(t => t.id === taskId)!
    ).filter(Boolean);
  }

  private async assignTasks(
    tasks: TaskWithStatus[],
    agents: SwarmAgent[]
  ): Promise<Map<string, string[]>> {
    const assignments = new Map<string, string[]>();
    const availableAgents = new Set(agents.map(a => a.getId()));

    for (const task of tasks) {
      if (task.status !== 'pending') continue;

      // Find suitable agents
      const suitableAgents = this.findSuitableAgents(
        task,
        Array.from(availableAgents).map(id => 
          agents.find(a => a.getId() === id)!
        )
      );

      if (suitableAgents.length > 0) {
        // Optimize agent selection
        const selectedAgents = await this.optimizeAgentSelection(
          task,
          suitableAgents
        );

        // Update assignments
        assignments.set(task.id, selectedAgents.map(a => a.getId()));
        
        // Remove assigned agents from available pool
        selectedAgents.forEach(agent => 
          availableAgents.delete(agent.getId())
        );
      }
    }

    return assignments;
  }

  private findSuitableAgents(
    task: TaskWithStatus,
    agents: SwarmAgent[]
  ): SwarmAgent[] {
    return agents.filter(agent => {
      // Check if agent has required capabilities
      const hasCapabilities = task.requirements.every(req =>
        agent.getCapabilities().some(cap => cap.name === req)
      );

      // Check if agent meets autonomy requirement
      const meetsAutonomy = agent.getCapabilities().some(cap =>
        cap.autonomyLevel >= task.autonomyRequired
      );

      // Check if agent has sufficient energy
      const hasEnergy = agent.getState().energy >= task.energyCost;

      return hasCapabilities && meetsAutonomy && hasEnergy;
    });
  }

  private async optimizeAgentSelection(
    task: TaskWithStatus,
    agents: SwarmAgent[]
  ): Promise<SwarmAgent[]> {
    // Calculate optimal number of agents needed
    const optimalCount = this.calculateOptimalAgentCount(task);

    // Score agents based on suitability
    const scoredAgents = agents.map(agent => ({
      agent,
      score: this.calculateAgentScore(agent, task)
    }));

    // Sort by score and select top agents
    return scoredAgents
      .sort((a, b) => b.score - a.score)
      .slice(0, optimalCount)
      .map(scored => scored.agent);
  }

  private calculateOptimalAgentCount(task: TaskWithStatus): number {
    // Base count on task complexity and requirements
    const baseCount = Math.ceil(task.complexity * 3);
    
    // Adjust for energy requirements
    const energyFactor = task.energyCost / 100;
    
    // Adjust for autonomy requirements
    const autonomyFactor = 1 + (1 - task.autonomyRequired);

    return Math.max(1, Math.min(5, Math.round(
      baseCount * energyFactor * autonomyFactor
    )));
  }

  private calculateAgentScore(agent: SwarmAgent, task: TaskWithStatus): number {
    const state = agent.getState();
    const capabilities = agent.getCapabilities();

    // Calculate capability match score
    const capabilityScore = task.requirements.reduce((score, req) => {
      const capability = capabilities.find(cap => cap.name === req);
      return score + (capability ? capability.successRate : 0);
    }, 0) / task.requirements.length;

    // Calculate performance score
    const performanceScore = (
      state.performance.successRate +
      state.performance.taskCompletion +
      state.performance.collaborationScore
    ) / 3;

    // Calculate energy efficiency
    const energyEfficiency = state.energy / task.energyCost;

    // Combine scores with weights
    return (
      capabilityScore * 0.4 +
      performanceScore * 0.3 +
      energyEfficiency * 0.3
    );
  }

  getTaskStats(): {
    totalTasks: number;
    pendingTasks: number;
    assignedTasks: number;
    averageComplexity: number;
  } {
    return this.taskGraph.getStats();
  }

  clear(): void {
    this.taskGraph.clear();
    this.taskQueue.clear();
    this.resourceAllocator.clear();
  }
}