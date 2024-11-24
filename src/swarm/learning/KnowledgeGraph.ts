import { Logger } from '../../cogutil/Logger';
import { SwarmAgent } from '../SwarmAgent';
import { TaskWithStatus } from '../types';

interface GraphNode {
  id: string;
  type: 'agent' | 'task';
  data: any;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  type: 'collaboration' | 'assignment';
}

export class KnowledgeGraph {
  private nodes: Map<string, GraphNode>;
  private edges: Map<string, GraphEdge>;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    Logger.info('KnowledgeGraph initialized');
  }

  addAgentNode(agent: SwarmAgent): void {
    try {
      const node: GraphNode = {
        id: agent.getId(),
        type: 'agent',
        data: {
          capabilities: agent.getCapabilities(),
          performance: agent.getState().performance
        }
      };
      this.nodes.set(node.id, node);
    } catch (error) {
      Logger.error('Failed to add agent node:', error);
      throw error;
    }
  }

  addTaskNode(task: TaskWithStatus): void {
    try {
      const node: GraphNode = {
        id: task.id,
        type: 'task',
        data: {
          description: task.description,
          requirements: task.requirements,
          complexity: task.complexity,
          status: task.status
        }
      };
      this.nodes.set(node.id, node);
    } catch (error) {
      Logger.error('Failed to add task node:', error);
      throw error;
    }
  }

  addRelationship(
    sourceId: string,
    targetId: string,
    weight: number,
    type: 'collaboration' | 'assignment' = 'assignment'
  ): void {
    try {
      const edgeId = `${sourceId}-${targetId}`;
      const edge: GraphEdge = {
        source: sourceId,
        target: targetId,
        weight,
        type
      };
      this.edges.set(edgeId, edge);
    } catch (error) {
      Logger.error('Failed to add relationship:', error);
      throw error;
    }
  }

  addAgentCollaboration(
    agent1Id: string,
    agent2Id: string,
    weight: number
  ): void {
    this.addRelationship(agent1Id, agent2Id, weight, 'collaboration');
  }

  getRecommendations(agentId: string): any[] {
    try {
      const recommendations: any[] = [];
      const agent = this.nodes.get(agentId);
      if (!agent) return recommendations;

      // Get collaborating agents
      const collaborators = this.getCollaborators(agentId);

      // Get successful tasks from collaborators
      collaborators.forEach(collaborator => {
        const collaboratorTasks = this.getAgentTasks(collaborator.id);
        collaboratorTasks.forEach(task => {
          if (task.data.status === 'completed') {
            recommendations.push({
              task: task.data,
              confidence: this.calculateRecommendationConfidence(
                agent,
                collaborator,
                task
              )
            });
          }
        });
      });

      return recommendations.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      Logger.error('Failed to get recommendations:', error);
      return [];
    }
  }

  private getCollaborators(agentId: string): GraphNode[] {
    const collaborators: GraphNode[] = [];
    
    this.edges.forEach(edge => {
      if (edge.type === 'collaboration' && edge.source === agentId) {
        const collaborator = this.nodes.get(edge.target);
        if (collaborator) {
          collaborators.push(collaborator);
        }
      }
    });

    return collaborators;
  }

  private getAgentTasks(agentId: string): GraphNode[] {
    const tasks: GraphNode[] = [];
    
    this.edges.forEach(edge => {
      if (edge.type === 'assignment' && edge.source === agentId) {
        const task = this.nodes.get(edge.target);
        if (task) {
          tasks.push(task);
        }
      }
    });

    return tasks;
  }

  private calculateRecommendationConfidence(
    agent: GraphNode,
    collaborator: GraphNode,
    task: GraphNode
  ): number {
    // Calculate based on:
    // 1. Agent capabilities matching task requirements
    const capabilityMatch = this.calculateCapabilityMatch(
      agent.data.capabilities,
      task.data.requirements
    );

    // 2. Collaborator's success with the task
    const collaboratorSuccess = collaborator.data.performance.successRate;

    // 3. Task complexity vs agent performance
    const complexityMatch = 1 - Math.abs(
      task.data.complexity - agent.data.performance.taskCompletion
    );

    return (capabilityMatch + collaboratorSuccess + complexityMatch) / 3;
  }

  private calculateCapabilityMatch(
    capabilities: any[],
    requirements: string[]
  ): number {
    const matches = requirements.filter(req =>
      capabilities.some(cap => cap.name === req)
    );
    return matches.length / requirements.length;
  }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
  }

  getStats(): {
    nodeCount: number;
    edgeCount: number;
    agentCount: number;
    taskCount: number;
  } {
    const agentCount = Array.from(this.nodes.values())
      .filter(node => node.type === 'agent').length;
    
    const taskCount = Array.from(this.nodes.values())
      .filter(node => node.type === 'task').length;

    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      agentCount,
      taskCount
    };
  }
}