export interface WorkflowTrigger {
  id: string;
  cronExpression: string;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamActivity {
  id: string;
  name: string;
  description: string;
  type: 'learning' | 'practice' | 'collaboration';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string[];
  created_at: string;
  updated_at: string;
}