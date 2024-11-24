import { db } from '../core';
import { WorkflowTrigger, TeamActivity } from '../../../types';
import { validateWorkflowTrigger, validateTeamActivity } from '../validation';
import { DEFAULT_TRIGGERS, DEFAULT_ACTIVITIES } from '../defaults/flows';

export async function getTriggers(): Promise<WorkflowTrigger[]> {
  await db.initialize();
  const dbState = db.getDb();
  if (!dbState.triggers || dbState.triggers.length === 0) {
    await initializeDefaultTriggers();
  }
  return db.getDb().triggers;
}

export async function getTeamActivities(): Promise<TeamActivity[]> {
  await db.initialize();
  const dbState = db.getDb();
  if (!dbState.teamActivities || dbState.teamActivities.length === 0) {
    await initializeDefaultActivities();
  }
  return db.getDb().teamActivities;
}

export async function addTrigger(trigger: Omit<WorkflowTrigger, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowTrigger> {
  await db.initialize();
  const validation = validateWorkflowTrigger(trigger);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const newTrigger: WorkflowTrigger = {
    ...trigger,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const dbState = db.getDb();
  dbState.triggers.push(newTrigger);
  await db.saveDb(dbState);
  return newTrigger;
}

export async function updateTrigger(id: string, updates: Partial<WorkflowTrigger>): Promise<WorkflowTrigger> {
  await db.initialize();
  const validation = validateWorkflowTrigger(updates);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const dbState = db.getDb();
  const index = dbState.triggers.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Trigger not found');
  }

  const updatedTrigger = {
    ...dbState.triggers[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  dbState.triggers[index] = updatedTrigger;
  await db.saveDb(dbState);
  return updatedTrigger;
}

export async function addTeamActivity(activity: Omit<TeamActivity, 'id' | 'created_at' | 'updated_at'>): Promise<TeamActivity> {
  await db.initialize();
  const validation = validateTeamActivity(activity);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const newActivity: TeamActivity = {
    ...activity,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const dbState = db.getDb();
  dbState.teamActivities.push(newActivity);
  await db.saveDb(dbState);
  return newActivity;
}

export async function updateTeamActivity(id: string, updates: Partial<TeamActivity>): Promise<TeamActivity> {
  await db.initialize();
  const validation = validateTeamActivity(updates);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const dbState = db.getDb();
  const index = dbState.teamActivities.findIndex(a => a.id === id);
  if (index === -1) {
    throw new Error('Activity not found');
  }

  const updatedActivity = {
    ...dbState.teamActivities[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  dbState.teamActivities[index] = updatedActivity;
  await db.saveDb(dbState);
  return updatedActivity;
}

async function initializeDefaultTriggers(): Promise<void> {
  const dbState = db.getDb();
  dbState.triggers = [];
  
  for (const trigger of DEFAULT_TRIGGERS) {
    const newTrigger: WorkflowTrigger = {
      ...trigger,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbState.triggers.push(newTrigger);
  }
  
  await db.saveDb(dbState);
}

async function initializeDefaultActivities(): Promise<void> {
  const dbState = db.getDb();
  dbState.teamActivities = [];
  
  for (const activity of DEFAULT_ACTIVITIES) {
    const newActivity: TeamActivity = {
      ...activity,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbState.teamActivities.push(newActivity);
  }
  
  await db.saveDb(dbState);
}