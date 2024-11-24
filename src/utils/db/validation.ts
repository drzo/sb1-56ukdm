import { Task, ChatHistoryEntry, Skill, WorkflowTrigger, MemoryFunction, TeamActivity, MemorySystem, AssistantInstance } from '../../types';
import { ValidationResult } from './types';

export function validateTask(task: Partial<Task>): ValidationResult {
  const errors: string[] = [];

  if (!task.title?.trim()) {
    errors.push('Task title is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateChatEntry(entry: Partial<ChatHistoryEntry>): ValidationResult {
  const errors: string[] = [];

  if (!entry.content?.trim()) {
    errors.push('Chat content is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateSkill(skill: Partial<Skill>): ValidationResult {
  const errors: string[] = [];

  if (!skill.command?.trim()) {
    errors.push('Skill command is required');
  }

  if (!skill.description?.trim()) {
    errors.push('Skill description is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateWorkflowTrigger(trigger: Partial<WorkflowTrigger>): ValidationResult {
  const errors: string[] = [];

  if (!trigger.cronExpression?.trim()) {
    errors.push('Cron expression is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMemoryFunction(func: Partial<MemoryFunction>): ValidationResult {
  const errors: string[] = [];

  if (!func.name?.trim()) {
    errors.push('Function name is required');
  }

  if (!func.code?.trim()) {
    errors.push('Function code is required');
  }

  if (!func.systemId?.trim()) {
    errors.push('System ID is required');
  }

  if (!func.assistantId?.trim()) {
    errors.push('Assistant ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateTeamActivity(activity: Partial<TeamActivity>): ValidationResult {
  const errors: string[] = [];

  if (!activity.name?.trim()) {
    errors.push('Activity name is required');
  }

  if (!activity.type) {
    errors.push('Activity type is required');
  }

  if (!activity.assignedTo?.length) {
    errors.push('At least one team member must be assigned');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMemorySystem(system: Partial<MemorySystem>): ValidationResult {
  const errors: string[] = [];

  if (!system.name?.trim()) {
    errors.push('Memory system name is required');
  }

  if (!system.type?.trim()) {
    errors.push('Memory system type is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAssistantInstance(instance: Partial<AssistantInstance>): ValidationResult {
  const errors: string[] = [];

  if (!instance.name?.trim()) {
    errors.push('Assistant instance name is required');
  }

  if (!instance.assistantId?.trim()) {
    errors.push('Assistant ID is required');
  }

  if (!instance.type || !['production', 'development', 'orchestrator'].includes(instance.type)) {
    errors.push('Invalid assistant type');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}