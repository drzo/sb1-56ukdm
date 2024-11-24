import { describe, it, expect, beforeEach } from 'vitest';
import { SwarmSpace } from '../swarm/SwarmSpace';
import { AgentCapability } from '../types/SwarmTypes';
import { SwarmAgent } from '../swarm/SwarmAgent';

describe('SwarmSpace', () => {
  let swarmSpace: SwarmSpace;

  beforeEach(() => {
    swarmSpace = new SwarmSpace();
  });

  it('should create and manage agents', () => {
    const capabilities: AgentCapability[] = [{
      name: 'test',
      description: 'Test capability',
      parameters: {},
      autonomyLevel: 0.5,
      learningRate: 0.1
    }];

    const agent = new SwarmAgent('TestAgent', capabilities);
    expect(agent.getName()).toBe('TestAgent');
    expect(agent.hasCapability('test')).toBe(true);
  });

  it('should create and assign tasks', async () => {
    const capabilities: AgentCapability[] = [{
      name: 'test',
      description: 'Test capability',
      parameters: {}
    }];

    const agent = new SwarmAgent('TestAgent', capabilities);
    const task = swarmSpace.createTask('Test task', ['test']);

    await swarmSpace.assignTask(task.getId(), [agent.getId()]);
    const taskStatus = swarmSpace.getTaskStatus(task.getId());
    
    expect(taskStatus?.status).toBe('in_progress');
    expect(taskStatus?.agents).toContain(agent.getId());
  });

  it('should track task metrics', () => {
    const initialMetrics = swarmSpace.getTaskMetrics();
    expect(initialMetrics.total).toBe(0);
    expect(initialMetrics.pending).toBe(0);
    expect(initialMetrics.completed).toBe(0);

    swarmSpace.createTask('Task 1', ['test']);
    swarmSpace.createTask('Task 2', ['test']);

    const updatedMetrics = swarmSpace.getTaskMetrics();
    expect(updatedMetrics.total).toBe(2);
    expect(updatedMetrics.pending).toBe(2);
  });
});