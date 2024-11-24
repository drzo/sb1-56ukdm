import { TaskWithStatus } from '../types';
import { Logger } from '../../cogutil/Logger';

interface TaskNode {
  task: TaskWithStatus;
  dependencies: Set<string>;
  dependents: Set<string>;
}

export class TaskGraph {
  private nodes: Map<string, TaskNode>;

  constructor() {
    this.nodes = new Map();
  }

  addTask(task: TaskWithStatus): void {
    if (!this.nodes.has(task.id)) {
      this.nodes.set(task.id, {
        task,
        dependencies: new Set(),
        dependents: new Set()
      });
    }
  }

  addDependency(dependency: TaskWithStatus, dependent: TaskWithStatus): void {
    try {
      // Ensure both tasks exist in graph
      this.addTask(dependency);
      this.addTask(dependent);

      // Add dependency relationship
      const dependentNode = this.nodes.get(dependent.id)!;
      const dependencyNode = this.nodes.get(dependency.id)!;

      dependentNode.dependencies.add(dependency.id);
      dependencyNode.dependents.add(dependent.id);

      // Check for cycles
      if (this.hasCycle()) {
        // Remove the dependency if it creates a cycle
        dependentNode.dependencies.delete(dependency.id);
        dependencyNode.dependents.delete(dependent.id);
        throw new Error('Cannot add dependency: would create cycle');
      }
    } catch (error) {
      Logger.error('Failed to add dependency:', error);
      throw error;
    }
  }

  getTopologicalSort(): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        throw new Error('Graph has cycles');
      }
      if (!visited.has(nodeId)) {
        temp.add(nodeId);
        const node = this.nodes.get(nodeId)!;
        node.dependencies.forEach(depId => visit(depId));
        temp.delete(nodeId);
        visited.add(nodeId);
        order.unshift(nodeId);
      }
    };

    try {
      for (const nodeId of this.nodes.keys()) {
        if (!visited.has(nodeId)) {
          visit(nodeId);
        }
      }
      return order;
    } catch (error) {
      Logger.error('Topological sort failed:', error);
      throw error;
    }
  }

  private hasCycle(): boolean {
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (nodeId: string): boolean => {
      if (temp.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      temp.add(nodeId);
      const node = this.nodes.get(nodeId)!;

      for (const depId of node.dependencies) {
        if (visit(depId)) return true;
      }

      temp.delete(nodeId);
      visited.add(nodeId);
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (visit(nodeId)) return true;
    }

    return false;
  }

  getDependencies(taskId: string): Set<string> {
    return this.nodes.get(taskId)?.dependencies || new Set();
  }

  getDependents(taskId: string): Set<string> {
    return this.nodes.get(taskId)?.dependents || new Set();
  }

  getStats(): {
    totalTasks: number;
    pendingTasks: number;
    assignedTasks: number;
    averageComplexity: number;
  } {
    const tasks = Array.from(this.nodes.values()).map(n => n.task);
    
    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      assignedTasks: tasks.filter(t => t.assignedAgents.length > 0).length,
      averageComplexity: tasks.reduce((sum, t) => sum + t.complexity, 0) / tasks.length
    };
  }

  clear(): void {
    this.nodes.clear();
  }
}