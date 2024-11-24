import { v4 as uuidv4 } from 'uuid';
import { AtomSpace } from '../../atomspace/core';
import { SwarmAtom } from '../SwarmAtom';
import { SwarmNodeType, AgentCapability, TaskWithStatus } from '../types';
import { TruthValue } from '../../types/Atom';
import { LinkType } from '../../types/AtomTypes';
import { Logger } from '../../cogutil/Logger';
import { AutonomousAgent } from './AutonomousAgent';

export class SwarmAtomSpace extends AtomSpace {
  private agents: Map<string, AutonomousAgent>;
  private tasks: Map<string, TaskWithStatus>;
  private taskAssignments: Map<string, string[]>;

  constructor() {
    super();
    this.agents = new Map();
    this.tasks = new Map();
    this.taskAssignments = new Map();
    Logger.info('SwarmAtomSpace initialized');
  }

  createAgent(name: string, capabilities: AgentCapability[]): AutonomousAgent {
    const agent = new AutonomousAgent(name, capabilities);
    this.agents.set(agent.getId(), agent);
    Logger.info(`Created agent: ${name}`);
    return agent;
  }

  addTask(task: TaskWithStatus): void {
    this.tasks.set(task.id, task);
    Logger.info(`Added task: ${task.id}`);
  }

  async assignTask(taskId: string, agentIds: string[]): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const agents = agentIds
      .map(id => this.agents.get(id))
      .filter((agent): agent is AutonomousAgent => agent !== undefined);

    if (agents.length === 0) {
      throw new Error('No valid agents found');
    }

    // Update task status
    task.status = 'in_progress';
    task.assignedAgents = agentIds;
    this.tasks.set(taskId, task);

    // Update agent states
    for (const agent of agents) {
      await agent.assignTask(taskId);
    }

    // Update assignments
    this.taskAssignments.set(taskId, agentIds);

    Logger.info(`Assigned task ${taskId} to agents: ${agentIds.join(', ')}`);
  }

  getAvailableAgents(): AutonomousAgent[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.getState().status === 'idle');
  }

  getPendingTasks(): TaskWithStatus[] {
    return Array.from(this.tasks.values())
      .filter(task => task.status === 'pending');
  }

  getTaskAssignments(): Map<string, string[]> {
    return new Map(this.taskAssignments);
  }

  getMetrics(): {
    agentCount: number;
    activeTaskCount: number;
    averageSuccessRate: number;
    averageCollaborationScore: number;
  } {
    const agents = Array.from(this.agents.values());
    return {
      agentCount: agents.length,
      activeTaskCount: Array.from(this.tasks.values())
        .filter(t => t.status === 'in_progress').length,
      averageSuccessRate: agents.reduce((sum, agent) => 
        sum + agent.getState().performance.successRate, 0) / Math.max(1, agents.length),
      averageCollaborationScore: agents.reduce((sum, agent) => 
        sum + agent.getState().performance.collaborationScore, 0) / Math.max(1, agents.length)
    };
  }
}