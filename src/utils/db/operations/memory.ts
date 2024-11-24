import { db } from '../core';
import { MemorySystem, MemoryFunction, AssistantInstance } from '../../../types';
import { validateMemorySystem, validateMemoryFunction, validateAssistantInstance } from '../validation';
import { DEFAULT_FUNCTIONS } from '../defaults/flows';

export async function getMemorySystems(): Promise<MemorySystem[]> {
  await db.initialize();
  return db.getDb().memorySystems;
}

export async function getMemoryFunctions(): Promise<MemoryFunction[]> {
  await db.initialize();
  const dbState = db.getDb();
  if (!dbState.memoryFunctions || dbState.memoryFunctions.length === 0) {
    await initializeDefaultFunctions();
  }
  return db.getDb().memoryFunctions;
}

export async function getAssistantInstances(): Promise<AssistantInstance[]> {
  await db.initialize();
  return db.getDb().assistantInstances;
}

export async function addMemorySystem(system: Omit<MemorySystem, 'id' | 'created_at' | 'updated_at'>): Promise<MemorySystem> {
  await db.initialize();
  const validation = validateMemorySystem(system);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const newSystem: MemorySystem = {
    ...system,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const dbState = db.getDb();
  dbState.memorySystems.push(newSystem);
  await db.saveDb(dbState);
  return newSystem;
}

export async function addMemoryFunction(func: Omit<MemoryFunction, 'id' | 'created_at' | 'updated_at'>): Promise<MemoryFunction> {
  await db.initialize();
  const validation = validateMemoryFunction(func);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const newFunction: MemoryFunction = {
    ...func,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const dbState = db.getDb();
  dbState.memoryFunctions.push(newFunction);
  await db.saveDb(dbState);
  return newFunction;
}

export async function updateMemoryFunction(id: string, updates: Partial<MemoryFunction>): Promise<MemoryFunction> {
  await db.initialize();
  const validation = validateMemoryFunction(updates);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const dbState = db.getDb();
  const index = dbState.memoryFunctions.findIndex(f => f.id === id);
  if (index === -1) {
    throw new Error('Memory function not found');
  }

  const updatedFunction = {
    ...dbState.memoryFunctions[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  dbState.memoryFunctions[index] = updatedFunction;
  await db.saveDb(dbState);
  return updatedFunction;
}

export async function addAssistantInstance(instance: Omit<AssistantInstance, 'id' | 'created_at' | 'updated_at'>): Promise<AssistantInstance> {
  await db.initialize();
  const validation = validateAssistantInstance(instance);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const dbState = db.getDb();
  
  // Check if instance with same assistantId already exists
  const existingInstance = dbState.assistantInstances.find(i => i.assistantId === instance.assistantId);
  if (existingInstance) {
    // Update existing instance
    const updatedInstance: AssistantInstance = {
      ...existingInstance,
      ...instance,
      updated_at: new Date().toISOString()
    };
    const index = dbState.assistantInstances.findIndex(i => i.id === existingInstance.id);
    dbState.assistantInstances[index] = updatedInstance;
    await db.saveDb(dbState);
    return updatedInstance;
  }

  // Create new instance
  const newInstance: AssistantInstance = {
    ...instance,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  dbState.assistantInstances.push(newInstance);
  await db.saveDb(dbState);
  return newInstance;
}

async function initializeDefaultFunctions(): Promise<void> {
  const dbState = db.getDb();
  dbState.memoryFunctions = [];
  
  for (const func of DEFAULT_FUNCTIONS) {
    const newFunction: MemoryFunction = {
      ...func,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbState.memoryFunctions.push(newFunction);
  }
  
  await db.saveDb(dbState);
}