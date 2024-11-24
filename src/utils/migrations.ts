import { DatabaseSchema, MigrationResult } from './db/types';

const CURRENT_VERSION = 2;

const migrations: Record<number, (db: DatabaseSchema) => Promise<DatabaseSchema>> = {
  1: async (db: DatabaseSchema) => {
    // Initial schema
    return {
      version: 1,
      tasks: [],
      chatHistory: [],
      skills: [],
      triggers: [],
      memoryFunctions: [],
      teamActivities: [],
      memorySystems: [],
      assistantInstances: []
    };
  },
  2: async (db: DatabaseSchema) => {
    // Add memory management tables
    return {
      ...db,
      memorySystems: db.memorySystems || [],
      assistantInstances: db.assistantInstances || [],
      version: 2
    };
  }
};

export async function migrateDatabase(db: DatabaseSchema): Promise<MigrationResult> {
  try {
    let currentDb = { ...db };
    const fromVersion = db.version;

    if (fromVersion >= CURRENT_VERSION) {
      return {
        success: true,
        fromVersion,
        toVersion: fromVersion
      };
    }

    for (let version = fromVersion + 1; version <= CURRENT_VERSION; version++) {
      const migration = migrations[version];
      if (migration) {
        currentDb = await migration(currentDb);
        currentDb.version = version;
      }
    }

    return {
      success: true,
      fromVersion,
      toVersion: CURRENT_VERSION
    };
  } catch (error) {
    return {
      success: false,
      fromVersion: db.version,
      toVersion: CURRENT_VERSION,
      error: error instanceof Error ? error.message : 'Unknown migration error'
    };
  }
}

export function getInitialSchema(): DatabaseSchema {
  return {
    version: 1,
    tasks: [],
    chatHistory: [],
    skills: [],
    triggers: [],
    memoryFunctions: [],
    teamActivities: [],
    memorySystems: [],
    assistantInstances: []
  };
}