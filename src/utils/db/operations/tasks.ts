import { db } from '../core';
import { Task } from '../../../types';
import { validateTask } from '../validation';

export async function getTasks(): Promise<Task[]> {
  await db.initialize();
  return db.getDb().tasks;
}

export async function addTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  await db.initialize();
  const validation = validateTask(task);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const dbState = db.getDb();
  dbState.tasks.push(newTask);
  await db.saveDb(dbState);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  await db.initialize();
  const validation = validateTask(updates);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const dbState = db.getDb();
  const index = dbState.tasks.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  const updatedTask = {
    ...dbState.tasks[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  dbState.tasks[index] = updatedTask;
  await db.saveDb(dbState);
  return updatedTask;
}