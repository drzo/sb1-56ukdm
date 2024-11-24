import { db } from './core';
import { Skill } from '../../types';
import { validateSkill } from './validation';

// Initialize default skills
const DEFAULT_SKILLS: Omit<Skill, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    command: 'Basic Arithmetic',
    description: 'Perform basic arithmetic operations including addition, subtraction, multiplication, and division',
    level: 1,
    experience: 0,
    experienceRequired: 100,
    status: 'learning',
    learningPaths: [
      {
        id: crypto.randomUUID(),
        name: 'Arithmetic Fundamentals',
        description: 'Master the basics of arithmetic operations',
        steps: [
          {
            id: crypto.randomUUID(),
            description: 'Practice addition and subtraction',
            completed: false
          },
          {
            id: crypto.randomUUID(),
            description: 'Practice multiplication and division',
            completed: false
          }
        ],
        status: 'not_started'
      }
    ]
  },
  {
    command: 'Memory Management',
    description: 'Manage and organize memory systems, functions, and assistant instances',
    level: 1,
    experience: 0,
    experienceRequired: 150,
    status: 'learning',
    learningPaths: [
      {
        id: crypto.randomUUID(),
        name: 'Memory Systems',
        description: 'Learn to work with different memory systems',
        steps: [
          {
            id: crypto.randomUUID(),
            description: 'Understand memory system types',
            completed: false
          },
          {
            id: crypto.randomUUID(),
            description: 'Practice memory function mapping',
            completed: false
          }
        ],
        status: 'not_started'
      }
    ]
  }
];

export async function getSkills(): Promise<Skill[]> {
  await db.initialize();
  const dbState = db.getDb();
  if (!dbState.skills || dbState.skills.length === 0) {
    await initializeDefaultSkills();
  }
  return db.getDb().skills;
}

export async function addSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<Skill> {
  await db.initialize();
  const validation = validateSkill(skill);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const newSkill: Skill = {
    ...skill,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const dbState = db.getDb();
  dbState.skills = dbState.skills || [];
  dbState.skills.push(newSkill);
  await db.saveDb(dbState);
  return newSkill;
}

export async function updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
  await db.initialize();
  const validation = validateSkill(updates);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const dbState = db.getDb();
  const index = dbState.skills.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error('Skill not found');
  }

  const updatedSkill = {
    ...dbState.skills[index],
    ...updates,
    updated_at: new Date().toISOString()
  };

  dbState.skills[index] = updatedSkill;
  await db.saveDb(dbState);
  return updatedSkill;
}

export async function initializeDefaultSkills(): Promise<void> {
  await db.initialize();
  const dbState = db.getDb();
  
  if (!dbState.skills || dbState.skills.length === 0) {
    dbState.skills = [];
    for (const skill of DEFAULT_SKILLS) {
      const newSkill: Skill = {
        ...skill,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      dbState.skills.push(newSkill);
    }
    await db.saveDb(dbState);
  }
}