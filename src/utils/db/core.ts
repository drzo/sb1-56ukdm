import { DatabaseSchema } from './types';
import { migrateDatabase, getInitialSchema } from './migrations';

class Database {
  private static instance: Database | null = null;
  private db: DatabaseSchema;
  private initialized: boolean = false;

  private constructor() {
    this.db = getInitialSchema();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private async save(): Promise<void> {
    localStorage.setItem('deep-tree-echo-db', JSON.stringify(this.db));
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    const stored = localStorage.getItem('deep-tree-echo-db');
    if (stored) {
      this.db = JSON.parse(stored);
      const migrationResult = await migrateDatabase(this.db);
      if (!migrationResult.success) {
        console.error('Database migration failed:', migrationResult.error);
      }
    } else {
      await this.save();
    }

    this.initialized = true;
  }

  public getDb(): DatabaseSchema {
    return this.db;
  }

  public async saveDb(newDb: DatabaseSchema): Promise<void> {
    this.db = newDb;
    await this.save();
  }
}

// Create and export the singleton instance
const db = Database.getInstance();

// Export the initialize function
export const initDB = () => db.initialize();

export { db };
export default db;