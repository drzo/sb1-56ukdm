import { SwarmAgent } from '../SwarmAgent';
import { TaskWithStatus } from '../types';
import { Logger } from '../../cogutil/Logger';

interface ResourceAllocation {
  agentId: string;
  taskId: string;
  energyCost: number;
  startTime: number;
  duration: number;
}

export class ResourceAllocator {
  private allocations: Map<string, ResourceAllocation[]>;
  private readonly maxConcurrentTasks: number = 3;

  constructor() {
    this.allocations = new Map();
  }

  async allocateResources(
    task: TaskWithStatus,
    agents: SwarmAgent[]
  ): Promise<boolean> {
    try {
      const requiredEnergy = this.calculateRequiredEnergy(task, agents.length);
      const availableAgents = this.getAvailableAgents(agents, task.startTime);

      if (availableAgents.length < agents.length) {
        return false;
      }

      // Check if agents have sufficient energy
      for (const agent of agents) {
        if (agent.getState().energy < requiredEnergy) {
          return false;
        }
      }

      // Create allocations
      agents.forEach(agent => {
        const allocation: ResourceAllocation = {
          agentId: agent.getId(),
          taskId: task.id,
          energyCost: requiredEnergy,
          startTime: task.startTime,
          duration: task.expectedDuration
        };

        const agentAllocations = this.allocations.get(agent.getId()) || [];
        agentAllocations.push(allocation);
        this.allocations.set(agent.getId(), agentAllocations);
      });

      return true;
    } catch (error) {
      Logger.error('Resource allocation failed:', error);
      return false;
    }
  }

  private calculateRequiredEnergy(task: TaskWithStatus, agentCount: number): number {
    // Base energy cost
    let energy = task.energyCost;

    // Adjust for complexity
    energy *= (1 + task.complexity);

    // Adjust for agent count (more agents = less energy per agent)
    energy /= Math.sqrt(agentCount);

    return Math.ceil(energy);
  }

  private getAvailableAgents(agents: SwarmAgent[], startTime: number): SwarmAgent[] {
    return agents.filter(agent => {
      const agentAllocations = this.allocations.get(agent.getId()) || [];
      
      // Check concurrent task limit
      const concurrentTasks = agentAllocations.filter(allocation =>
        this.isTimeOverlap(allocation, startTime)
      );

      return concurrentTasks.length < this.maxConcurrentTasks;
    });
  }

  private isTimeOverlap(allocation: ResourceAllocation, startTime: number): boolean {
    const endTime = allocation.startTime + allocation.duration;
    return startTime >= allocation.startTime && startTime < endTime;
  }

  getAgentAllocations(agentId: string): ResourceAllocation[] {
    return this.allocations.get(agentId) || [];
  }

  getTaskAllocations(taskId: string): ResourceAllocation[] {
    const taskAllocations: ResourceAllocation[] = [];
    
    this.allocations.forEach(allocations => {
      allocations
        .filter(a => a.taskId === taskId)
        .forEach(a => taskAllocations.push(a));
    });

    return taskAllocations;
  }

  clear(): void {
    this.allocations.clear();
  }
}