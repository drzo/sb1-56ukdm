import { parseExpression } from 'node-cron';
import { useWorkflowStore } from '../store/workflowStore';
import { WorkflowTrigger, WorkflowState, WorkflowTask } from '../types/workflow';
import { useMemoryStore } from '../store/memoryStore';
import { useInstanceStore } from '../store/instanceStore';

class WorkflowManager {
  private static instance: WorkflowManager;
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    // Initialize workflow system
    this.setupCronJobs();
    this.monitorThresholds();
  }

  static getInstance(): WorkflowManager {
    if (!WorkflowManager.instance) {
      WorkflowManager.instance = new WorkflowManager();
    }
    return WorkflowManager.instance;
  }

  private setupCronJobs() {
    const schedules = useWorkflowStore.getState().schedules;
    
    schedules.forEach(schedule => {
      if (schedule.cronExpression) {
        try {
          const cronExpression = parseExpression(schedule.cronExpression);
          const nextRun = cronExpression.next().getTime();
          
          const timerId = setTimeout(() => {
            this.triggerWorkflow('cron', schedule.id);
          }, nextRun - Date.now());

          this.activeTimers.set(schedule.id, timerId);
        } catch (error) {
          console.error(`Invalid cron expression for schedule ${schedule.id}:`, error);
        }
      }
    });
  }

  private monitorThresholds() {
    // Monitor memory resonance and energy levels
    setInterval(() => {
      const { nodes } = useMemoryStore.getState();
      const schedules = useWorkflowStore.getState().schedules;

      schedules.forEach(schedule => {
        if (schedule.trigger === 'memory-threshold' && schedule.threshold) {
          const highResonanceNodes = nodes.filter(
            node => node.metrics.resonance > schedule.threshold!
          );

          if (highResonanceNodes.length > 0) {
            this.triggerWorkflow('memory-threshold', schedule.id);
          }
        }
      });
    }, 60000); // Check every minute
  }

  async triggerWorkflow(trigger: WorkflowTrigger, scheduleId: string) {
    const workflowStore = useWorkflowStore.getState();
    const currentState = workflowStore.currentState;
    const schedule = workflowStore.schedules.find(s => s.id === scheduleId);

    if (!schedule) return;

    // Update schedule timing
    workflowStore.updateSchedule(scheduleId, {
      lastRun: Date.now(),
      nextRun: trigger === 'cron' 
        ? this.calculateNextRun(schedule.cronExpression!)
        : undefined
    });

    // Execute workflow based on current state
    switch (currentState) {
      case 'sleeping':
        await this.startReviewPhase();
        break;

      case 'reviewing':
        await this.startLearningPhase();
        break;

      case 'learning':
        await this.startSocializingPhase();
        break;

      case 'socializing':
        await this.enterSleepPhase();
        break;
    }
  }

  private async startReviewPhase() {
    const workflowStore = useWorkflowStore.getState();
    const memoryStore = useMemoryStore.getState();

    // Set state to reviewing
    workflowStore.setState('reviewing');

    // Start a new learning session
    workflowStore.startSession(['Review recent memories', 'Plan learning objectives']);

    // Create review tasks
    const recentMemories = memoryStore.nodes
      .filter(node => Date.now() - node.timestamp < 24 * 60 * 60 * 1000)
      .sort((a, b) => b.metrics.resonance - a.metrics.resonance);

    recentMemories.forEach(memory => {
      workflowStore.addTask({
        type: 'review',
        status: 'pending',
        priority: memory.metrics.resonance,
        context: {
          memoryIds: [memory.id]
        }
      });
    });
  }

  private async startLearningPhase() {
    const workflowStore = useWorkflowStore.getState();
    
    // Set state to learning
    workflowStore.setState('learning');

    // Analyze patterns and create learning tasks
    const completedReviews = workflowStore.tasks
      .filter(task => task.type === 'review' && task.status === 'completed');

    const learningObjectives = this.analyzeLearningNeeds(completedReviews);

    learningObjectives.forEach(objective => {
      workflowStore.addTask({
        type: 'learn',
        status: 'pending',
        priority: objective.priority,
        context: {
          projectId: objective.projectId
        }
      });
    });
  }

  private async startSocializingPhase() {
    const workflowStore = useWorkflowStore.getState();
    const instanceStore = useInstanceStore.getState();

    // Set state to socializing
    workflowStore.setState('socializing');

    // Prepare network interactions
    const completedLearning = workflowStore.tasks
      .filter(task => task.type === 'learn' && task.status === 'completed');

    completedLearning.forEach(task => {
      // Create network interaction tasks
      workflowStore.addTask({
        type: 'socialize',
        status: 'pending',
        priority: task.priority,
        context: {
          projectId: task.context?.projectId,
          networkId: 'singularitynet'
        }
      });
    });

    // Activate instances for network interaction
    instanceStore.getActiveInstances().forEach(instance => {
      instanceStore.updateInstanceState(instance.id, {
        status: 'active',
        currentTask: 'network-interaction'
      });
    });
  }

  private async enterSleepPhase() {
    const workflowStore = useWorkflowStore.getState();
    
    // Complete current session
    const currentSession = workflowStore.sessions
      .find(session => !session.endTime);

    if (currentSession) {
      workflowStore.endSession({
        completed: workflowStore.tasks
          .filter(task => task.status === 'completed')
          .map(task => task.id),
        failed: workflowStore.tasks
          .filter(task => task.status === 'pending')
          .map(task => task.id),
        insights: [] // Add insights based on completed tasks
      });
    }

    // Set state to sleeping
    workflowStore.setState('sleeping');
  }

  private analyzeLearningNeeds(completedReviews: WorkflowTask[]): Array<{
    priority: number;
    projectId: string;
  }> {
    // Analyze completed reviews to identify learning needs
    // This is a simplified implementation
    return completedReviews.map(review => ({
      priority: review.priority,
      projectId: review.context?.projectId || 'default'
    }));
  }

  private calculateNextRun(cronExpression: string): number {
    try {
      const expression = parseExpression(cronExpression);
      return expression.next().getTime();
    } catch (error) {
      console.error('Invalid cron expression:', error);
      return Date.now() + 3600000; // Default to 1 hour
    }
  }

  cleanup() {
    // Clear all active timers
    this.activeTimers.forEach(timerId => clearTimeout(timerId));
    this.activeTimers.clear();
  }
}

export const workflowManager = WorkflowManager.getInstance();