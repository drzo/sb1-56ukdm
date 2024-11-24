import { Level } from 'level';
import { Logger } from '../cogutil/Logger';
import { Atom } from '../types/Atom';

export class RocksStorage {
  private db: Level;
  private static instance: RocksStorage;

  private constructor(dbPath: string) {
    this.db = new Level(dbPath, { valueEncoding: 'json' });
    Logger.info('RocksDB storage initialized');
  }

  public static getInstance(dbPath: string = './atomspace.db'): RocksStorage {
    if (!RocksStorage.instance) {
      RocksStorage.instance = new RocksStorage(dbPath);
    }
    return RocksStorage.instance;
  }

  async saveAtom(atom: Atom): Promise<void> {
    try {
      await this.db.put(atom.getId(), this.serializeAtom(atom));
      Logger.debug(`Saved atom: ${atom.getId()}`);
    } catch (error) {
      Logger.error('Failed to save atom:', error);
      throw error;
    }
  }

  async getAtom(id: string): Promise<Atom | null> {
    try {
      const data = await this.db.get(id);
      return this.deserializeAtom(data);
    } catch (error) {
      if ((error as any).type === 'NotFoundError') {
        return null;
      }
      Logger.error('Failed to get atom:', error);
      throw error;
    }
  }

  async removeAtom(id: string): Promise<void> {
    try {
      await this.db.del(id);
      Logger.debug(`Removed atom: ${id}`);
    } catch (error) {
      Logger.error('Failed to remove atom:', error);
      throw error;
    }
  }

  async getAllAtoms(): Promise<Atom[]> {
    const atoms: Atom[] = [];
    try {
      for await (const [key, value] of this.db.iterator()) {
        const atom = this.deserializeAtom(value);
        if (atom) atoms.push(atom);
      }
      return atoms;
    } catch (error) {
      Logger.error('Failed to get all atoms:', error);
      throw error;
    }
  }

  private serializeAtom(atom: Atom): string {
    return JSON.stringify({
      id: atom.getId(),
      type: atom.getType(),
      truthValue: atom.getTruthValue(),
      // Add any additional atom-specific data
    });
  }

  private deserializeAtom(data: string): Atom | null {
    try {
      const parsed = JSON.parse(data);
      // Reconstruct atom based on type
      // Implementation depends on atom types
      return null; // Placeholder
    } catch (error) {
      Logger.error('Failed to deserialize atom:', error);
      return null;
    }
  }

  async close(): Promise<void> {
    try {
      await this.db.close();
      Logger.info('RocksDB storage closed');
    } catch (error) {
      Logger.error('Failed to close storage:', error);
      throw error;
    }
  }
}