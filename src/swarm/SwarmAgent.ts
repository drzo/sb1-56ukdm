import { AgentCapability, AgentState, TaskWithStatus } from './types';
import { TruthValue } from '../types/Atom';
import { Logger } from '../cogutil/Logger';
import { Timer } from '../cogutil/Timer';
import { TaskPlanner } from './planning/TaskPlanner';
import { CollaborativeLearning } from './learning/CollaborativeLearning';

export class SwarmAgent {
  protected id: string;
  protected name: string;
  protected capabilities: AgentCapability[];
  protected truthValue: TruthValue;
  protected state: AgentState;
  protected taskPlanner: TaskPlanner;
  protected learning: CollaborativeLearning;
  private currentTask: TaskWithStatus | null = null;

  constructor(
    name: string,
    capabilities: AgentCapability[] = [],
    tv?: TruthValue
  ) {
    this.id = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.capabilities = capabilities;
    this.truthValue = tv || { strength: 1.0, confidence: 1.0 };
    this.state = this.initializeState();
    this.taskPlanner = new TaskPlanner();
    this.learning = new CollaborativeLearning();
    Logger.info(`SwarmAgent ${name} initialized with ${capabilities.length} capabilities`);
  }

  private initializeState(): AgentState {
    return {
      status: 'idle',
      currentTask: undefined,
      collaborators: [],
      resources: [],
      memory: {},
      goals: [],
      beliefs: new Map(),
      intentions: [],
      plans: [],
      energy: 100,
      performance: {
        successRate: 1.0,
        taskCompletion: 1.0,
        collaborationScore: 1.0,
        learningProgress: 0.0
      }
    };
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getCapabilities(): AgentCapability[] {
    return [...this.capabilities];
  }

  hasCapability(name: string): boolean {
    return this.capabilities.some(cap => cap.name === name);
  }

  getState(): AgentState {
    return { ...this.state };
  }

  getTruthValue(): TruthValue {
    return { ...this.truthValue };
  }

  async assignTask(taskId: string): Promise<void> {
    const timer = new Timer();
    try {
      if (this.state.status !== 'idle') {
        throw new Error('Agent is not idle');
      }

      this.state.status = 'working';
      this.state.currentTask = taskId;
      Logger.info(`Agent ${this.name} assigned task ${taskId}`);

      // Update energy based on task requirements
      if (this.currentTask) {
        this.state.energy -= this.currentTask.energyCost;
      }

      Logger.debug(`Task assignment completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error(`Failed to assign task ${taskId} to agent ${this.name}:`, error);
      throw error;
    }
  }

  async planTask(task: TaskWithStatus): Promise<boolean> {
    try {
      // Check if agent can handle task
      if (!this.canHandleTask(task)) {
        return false;
      }

      // Plan task execution
      const assignments = await this.taskPlanner.planTasks([task], [this]);
      const agentAssignment = assignments.get(task.id);

      if (agentAssignment?.includes(this.id)) {
        this.currentTask = task;
        return true;
      }

      return false;
    } catch (error) {
      Logger.error(`Failed to plan task for agent ${this.name}:`, error);
      return false;
    }
  }

  private canHandleTask(task: TaskWithStatus): boolean {
    // Check capabilities
    const hasRequiredCapabilities = task.requirements.every(req =>
      this.hasCapability(req)
    );

    // Check autonomy level
    const meetsAutonomy = this.capabilities.some(cap =>
      cap.autonomyLevel >= task.autonomyRequired
    );

    // Check energy
    const hasEnergy = this.state.energy >= task.energyCost;

    return hasRequiredCapabilities && meetsAutonomy && hasEnergy;
  }

  async executeTask(): Promise<void> {
    if (!this.currentTask) {
      throw new Error('No task assigned');
    }

    const timer = new Timer();
    try {
      // Simulate task execution
      await this.simulateTaskExecution();

      // Update performance metrics
      this.updatePerformanceMetrics(true);

      // Clear current task
      this.currentTask = null;
      this.state.status = 'idle';
      this.state.currentTask = undefined;

      Logger.info(`Agent ${this.name} completed task execution in ${timer.stop()}ms`);
    } catch (error) {
      this.updatePerformanceMetrics(false);
      Logger.error(`Task execution failed for agent ${this.name}:`, error);
      throw error;
    }
  }

  private async simulateTaskExecution(): Promise<void> {
    if (!this.currentTask) return;

    const duration = this.currentTask.expectedDuration;
    const complexity = this.currentTask.complexity;

    // Simulate work based on task complexity
    await new Promise(resolve => 
      setTimeout(resolve, duration * complexity * 100)
    );
  }

  private updatePerformanceMetrics(success: boolean): void {
    // Update success rate
    const currentSuccess = this.state.performance.successRate;
    this.state.performance.successRate = 
      (currentSuccess * 0.8) + (success ? 0.2 : 0);

    // Update task completion rate
    const currentCompletion = this.state.performance.taskCompletion;
    this.state.performance.taskCompletion = 
      (currentCompletion * 0.8) + (success ? 0.2 : 0);

    // Update learning progress
    this.state.performance.learningProgress += success ? 0.1 : -0.05;
    this.state.performance.learningProgress = Math.max(
      0,
      Math.min(1, this.state.performance.learningProgress)
    );
  }

  async collaborate(agents: SwarmAgent[]): Promise<void> {
    try {
      // Update collaborator list
      this.state.collaborators = agents.map(a => a.getId());

      // Share knowledge through collaborative learning
      if (this.currentTask) {
        await this.learning.trainCollaboratively(
          [this, ...agents],
          [this.currentTask]
        );
      }

      // Update collaboration score
      this.updateCollaborationScore(agents);
    } catch (error) {
      Logger.error(`Collaboration failed for agent ${this.name}:`, error);
      throw error;
    }
  }

  private updateCollaborationScore(collaborators: SwarmAgent[]): void {
    const scores = collaborators.map(agent => {
      const compatibility = this.calculateCompatibility(agent);
      const performance = agent.getState().performance.successRate;
      return (compatibility + performance) / 2;
    });

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    this.state.performance.collaborationScore = 
      (this.state.performance.collaborationScore * 0.7) + (averageScore * 0.3);
  }

  private calculateCompatibility(agent: SwarmAgent): number {
    const sharedCapabilities = this.capabilities.filter(cap1 =>
      agent.getCapabilities().some(cap2 => cap2.name === cap1.name)
    );

    return sharedCapabilities.length / Math.max(
      this.capabilities.length,
      agent.getCapabilities().length
    );
  }

  async reset(): Promise<void> {
    try {
      this.state = this.initializeState();
      this.currentTask = null;
      Logger.info(`Agent ${this.name} reset to idle state`);
    } catch (error) {
      Logger.error(`Failed to reset agent ${this.name}:`, error);
      throw error;
    }
  }

  dispose(): void {
    this.learning.dispose();
    this.taskPlanner.clear();
  }
}