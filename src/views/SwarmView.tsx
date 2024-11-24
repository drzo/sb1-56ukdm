import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SwarmAtomSpace } from '@/swarm/core/SwarmAtomSpace'
import { TaskWithStatus } from '@/swarm/types'
import { Logger } from '@/cogutil/Logger'
import { SwarmMetrics } from '@/components/swarm/SwarmMetrics'
import { AgentList } from '@/components/swarm/AgentList'
import { TaskList } from '@/components/swarm/TaskList'
import { AddEntityForm } from '@/components/swarm/AddEntityForm'

const swarmSpace = new SwarmAtomSpace();

export function SwarmView() {
  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [metrics, setMetrics] = useState(swarmSpace.getMetrics());
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(swarmSpace.getMetrics());
      updateAgentsAndTasks();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateAgentsAndTasks = () => {
    const allAgents = swarmSpace.getAvailableAgents();
    const pendingTasks = swarmSpace.getPendingTasks();
    const assignments = swarmSpace.getTaskAssignments();

    setAgents(allAgents);
    
    const updatedTasks = pendingTasks.map(task => ({
      ...task,
      status: assignments.has(task.id) ? 'in_progress' as const : 'pending' as const,
      assignedAgents: assignments.get(task.id) || []
    }));

    setTasks(updatedTasks);
  };

  const addAgent = () => {
    if (!newAgentName.trim()) {
      setError('Agent name cannot be empty');
      return;
    }

    try {
      const capabilities = [{
        name: 'basic',
        description: 'Basic agent capabilities',
        parameters: {},
        autonomyLevel: 0.5,
        learningRate: 0.1,
        energyCost: 10,
        successRate: 1.0
      }];
      
      const agent = swarmSpace.createAgent(newAgentName, capabilities);
      setNewAgentName('');
      setError(null);
      updateAgentsAndTasks();
      Logger.info(`Added agent: ${agent.getName()}`);
    } catch (err) {
      Logger.error('Failed to create agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    }
  };

  const addTask = () => {
    if (!newTaskDescription.trim()) {
      setError('Task description cannot be empty');
      return;
    }

    try {
      const task = {
        id: `task-${Date.now()}`,
        description: newTaskDescription,
        requirements: ['basic'],
        dependencies: [],
        priority: 1,
        autonomyRequired: 0.5,
        complexity: 0.5,
        expectedDuration: 3600,
        energyCost: 20,
        reward: 100,
        status: 'pending' as const,
        assignedAgents: []
      };

      swarmSpace.addTask(task);
      setNewTaskDescription('');
      setError(null);
      updateAgentsAndTasks();
      Logger.info(`Added task: ${task.id}`);
    } catch (err) {
      Logger.error('Failed to create task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const assignTask = async (taskId: string) => {
    try {
      if (!selectedAgent) {
        throw new Error('Please select an agent first');
      }

      await swarmSpace.assignTask(taskId, [selectedAgent]);
      updateAgentsAndTasks();
      setSelectedAgent(null);
      Logger.info(`Assigned task ${taskId} to agent ${selectedAgent}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign task';
      setError(errorMessage);
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Swarm Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <SwarmMetrics metrics={metrics} />
            <AddEntityForm
              onAddAgent={addAgent}
              onAddTask={addTask}
              agentName={newAgentName}
              taskDescription={newTaskDescription}
              onAgentNameChange={setNewAgentName}
              onTaskDescriptionChange={setNewTaskDescription}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AgentList
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
            />
            <TaskList
              tasks={tasks}
              selectedAgent={selectedAgent}
              onAssignTask={assignTask}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}