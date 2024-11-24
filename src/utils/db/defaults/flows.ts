import { WorkflowTrigger, MemoryFunction, TeamActivity } from '../../../types';

export const DEFAULT_TRIGGERS: Omit<WorkflowTrigger, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    cronExpression: '0 * * * *',
    isActive: true,
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 3600000).toISOString()
  },
  {
    cronExpression: '0 0 * * *',
    isActive: true,
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 86400000).toISOString()
  },
  {
    cronExpression: '*/15 * * * *',
    isActive: false,
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 900000).toISOString()
  }
];

export const DEFAULT_FUNCTIONS: Omit<MemoryFunction, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Summarize Chat History',
    description: 'Generate summaries of recent chat interactions',
    code: `async function summarizeChatHistory(entries) {
  const summary = await analyzeConversations(entries);
  return summary;
}`,
    systemId: 'memory-system-1',
    assistantId: 'asst_prod',
    isEnabled: true
  },
  {
    name: 'Update Skill Progress',
    description: 'Track and update skill development progress',
    code: `async function updateSkillProgress(skillId, progress) {
  const skill = await getSkill(skillId);
  return await updateSkillMetrics(skill, progress);
}`,
    systemId: 'memory-system-2',
    assistantId: 'asst_dev',
    isEnabled: true
  },
  {
    name: 'Integrate Learning Paths',
    description: 'Manage and optimize learning path progression',
    code: `async function integrateLearningPaths(paths) {
  const optimizedPaths = await analyzeLearningProgress(paths);
  return await updateLearningStrategy(optimizedPaths);
}`,
    systemId: 'memory-system-3',
    assistantId: 'asst_orchestrator',
    isEnabled: false
  }
];

export const DEFAULT_ACTIVITIES: Omit<TeamActivity, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Skill Practice Session',
    description: 'Group practice session for new skills',
    type: 'practice',
    status: 'in-progress',
    assignedTo: ['Deep Tree Echo', 'Assistant Alpha', 'Assistant Beta']
  },
  {
    name: 'Knowledge Integration',
    description: 'Integrate and share learned concepts',
    type: 'learning',
    status: 'pending',
    assignedTo: ['Deep Tree Echo', 'Assistant Gamma']
  },
  {
    name: 'Memory System Optimization',
    description: 'Collaborative memory system enhancement',
    type: 'collaboration',
    status: 'completed',
    assignedTo: ['Deep Tree Echo', 'Assistant Delta', 'Assistant Epsilon']
  }
];