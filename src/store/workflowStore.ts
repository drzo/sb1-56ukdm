import { create } from 'zustand';
import { 
  WorkflowSchedule, 
  WorkflowTask, 
  LearningSession,
  NetworkInteraction,
  WorkflowState 
} from '../types/workflow';
import { useSheafStore } from './sheafStore';

interface WorkflowState {
  schedules: WorkflowSchedule[];
  tasks: WorkflowTask[];
  sessions: LearningSession[];
  interactions: NetworkInteraction[];
  currentState: WorkflowState;

  // Schedule Management
  addSchedule: (schedule: Omit<WorkflowSchedule, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<WorkflowSchedule>) => void;
  removeSchedule: (id: string) => void;

  // Task Management
  addTask: (task: Omit<WorkflowTask, 'id'>) => void;
  updateTask: (id: string, updates: Partial<WorkflowTask>) => void;
  completeTask: (id: string) => void;

  // Session Management
  startSession: (objectives: string[]) => void;
  endSession: (progress: LearningSession['progress']) => void;
  
  // Network Interaction
  interact: (interaction: Omit<NetworkInteraction, 'id' | 'timestamp'>) => void;
  
  // Workflow State
  setState: (state: WorkflowState) => void;
  triggerWorkflow: (trigger: WorkflowTrigger) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  schedules: [],
  tasks: [],
  sessions: [],
  interactions: [],
  currentState: 'sleeping',

  addSchedule: (schedule) =>
    set((state) => ({
      schedules: [
        ...state.schedules,
        { ...schedule, id: Math.random().toString(36).substr(2, 9) }
      ],
    })),

  updateSchedule: (id, updates) =>
    set((state) => ({
      schedules: state.schedules.map((schedule) =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ),
    })),

  removeSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter((schedule) => schedule.id !== id),
    })),

  addTask: (task) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        { 
          ...task, 
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending'
        }
      ],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),

  completeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: 'completed' } : task
      ),
    })),

  startSession: (objectives) =>
    set((state) => ({
      sessions: [
        ...state.sessions,
        {
          id: Math.random().toString(36).substr(2, 9),
          startTime: Date.now(),
          objectives,
          progress: {
            completed: [],
            failed: [],
            insights: []
          },
          metrics: {
            resonanceGain: 0,
            energySpent: 0,
            memoriesFormed: 0
          }
        }
      ],
    })),

  endSession: (progress) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        !session.endTime
          ? {
              ...session,
              endTime: Date.now(),
              progress
            }
          : session
      ),
    })),

  interact: (interaction) =>
    set((state) => ({
      interactions: [
        ...state.interactions,
        {
          ...interaction,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
        }
      ],
    })),

  setState: (newState) =>
    set({ currentState: newState }),

  triggerWorkflow: (trigger) => {
    const { currentState, schedules } = get();
    
    // Find matching schedule
    const schedule = schedules.find(s => s.trigger === trigger);
    if (!schedule) return;

    // Update schedule timing
    get().updateSchedule(schedule.id, {
      lastRun: Date.now(),
      nextRun: trigger === 'cron' 
        ? calculateNextCronRun(schedule.cronExpression!)
        : undefined
    });

    // Execute workflow based on current state
    switch (currentState) {
      case 'sleeping':
        get().setState('reviewing');
        get().startSession(['Review recent memories', 'Plan learning objectives']);
        break;

      case 'reviewing':
        get().setState('learning');
        // Analyze memory patterns and create learning tasks
        break;

      case 'learning':
        get().setState('socializing');
        // Prepare network interactions based on learned content
        break;

      case 'socializing':
        get().setState('sleeping');
        get().endSession({
          completed: [],
          failed: [],
          insights: []
        });
        break;
    }
  }
}));

// Helper function to calculate next cron run time
function calculateNextCronRun(expression: string): number {
  // Implementation using cron parser library
  return Date.now() + 3600000; // Placeholder: 1 hour
}