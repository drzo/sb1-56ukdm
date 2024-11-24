import { v4 as uuidv4 } from 'uuid';
import { AtomSpace } from '../AtomSpace';
import { SwarmAtom } from './SwarmAtom';
import { SwarmNodeType, AgentCapability } from '../types/SwarmTypes';
import { TruthValue } from '../types/Atom';
import { LinkType } from '../types/AtomTypes';
import { Logger } from '../cogutil/Logger';

export class SwarmSpace extends AtomSpace {
  private agentNodes: Map<string, SwarmAtom>;
  private taskNodes: Map<string, SwarmAtom>;
  private goalNodes: Map<string, SwarmAtom>;

  constructor() {
    super();
    this.agentNodes = new Map();
    this.taskNodes = new Map();
    this.goalNodes = new Map();
  }

  createAgent(name: string, capabilities: AgentCapability[]): SwarmAtom {
    const id = `agent-${uuidv4()}`;
    const agent = new SwarmAtom(SwarmNodeType.AGENT, id, undefined, {
      name,
      capabilities,
      status: 'idle',
      tasks: []
    });
    
    this.agentNodes.set(id, agent);
    Logger.info(`Created agent: ${name} (${id})`);
    return agent;
  }

  createTask(description: string, requirements: string[], tv?: TruthValue): SwarmAtom {
    const id = `task-${uuidv4()}`;
    const task = new SwarmAtom(SwarmNodeType.TASK, id, tv, {
      description,
      requirements,
      status: 'pending',
      assignedAgents: []
    });
    
    this.taskNodes.set(id, task);
    Logger.info(`Created task: ${description} (${id})`);
    return task;
  }

  createGoal(description: string, criteria: string[], tv?: TruthValue): SwarmAtom {
    const id = `goal-${uuidv4()}`;
    const goal = new SwarmAtom(SwarmNodeType.GOAL, id, tv, {
      description,
      criteria,
      status: 'active',
      progress: 0
    });
    
    this.goalNodes.set(id, goal);
    Logger.info(`Created goal: ${description} (${id})`);
    return goal;
  }

  assignTask(taskId: string, agentIds: string[]): void {
    const task = this.taskNodes.get(taskId);
    if (!task) {
      Logger.error(`Task not found: ${taskId}`);
      throw new Error('Task not found');
    }

    const agents = agentIds
      .map(id => this.agentNodes.get(id))
      .filter((agent): agent is SwarmAtom => agent !== undefined);

    if (agents.length === 0) {
      Logger.error(`No valid agents found for task: ${taskId}`);
      throw new Error('No valid agents found');
    }

    // Check if agents have required capabilities
    const metadata = task.getMetadata();
    const hasRequiredCapabilities = agents.every(agent => {
      const agentCapabilities = agent.getMetadata().capabilities;
      return metadata.requirements.every((req: string) => 
        agentCapabilities.some(cap => cap.name === req)
      );
    });

    if (!hasRequiredCapabilities) {
      Logger.error(`Agents do not have required capabilities for task: ${taskId}`);
      throw new Error('Agents do not have required capabilities');
    }

    // Update task metadata
    task.updateMetadata({
      status: 'in_progress',
      assignedAgents: agentIds,
      startTime: new Date().toISOString()
    });

    // Update agent metadata
    agents.forEach(agent => {
      const agentMeta = agent.getMetadata();
      agent.updateMetadata({
        status: 'working',
        tasks: [...agentMeta.tasks, taskId]
      });
    });

    // Create collaboration links between agents
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        this.createCollaborationLink(agents[i], agents[j]);
      }
    }

    Logger.info(`Assigned task ${taskId} to agents: ${agentIds.join(', ')}`);
  }

  private createCollaborationLink(agent1: SwarmAtom, agent2: SwarmAtom): void {
    this.addLink(LinkType.COLLABORATES, [agent1, agent2]);
  }

  getTaskStatus(taskId: string): { task: { id: string; description: string }; status: string; agents: string[] } | null {
    const task = this.taskNodes.get(taskId);
    if (!task) {
      Logger.warn(`Task not found: ${taskId}`);
      return null;
    }

    const metadata = task.getMetadata();
    return {
      task: {
        id: taskId,
        description: metadata.description
      },
      status: metadata.status,
      agents: metadata.assignedAgents || []
    };
  }

  getAgentsByCapability(capability: string): SwarmAtom[] {
    return Array.from(this.agentNodes.values()).filter(agent => 
      agent.getMetadata().capabilities.some(cap => cap.name === capability)
    );
  }

  getAvailableAgents(): SwarmAtom[] {
    return Array.from(this.agentNodes.values()).filter(agent =>
      agent.getMetadata().status === 'idle'
    );
  }

  getPendingTasks(): SwarmAtom[] {
    return Array.from(this.taskNodes.values()).filter(task =>
      task.getMetadata().status === 'pending'
    );
  }

  getActiveGoals(): SwarmAtom[] {
    return Array.from(this.goalNodes.values()).filter(goal =>
      goal.getMetadata().status === 'active'
    );
  }
}