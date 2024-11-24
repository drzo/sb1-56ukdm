import { Atom } from '../types/Atom';
import { BrowserAtomDB } from './BrowserAtomDB';

export class AtomDB {
  private storage: BrowserAtomDB;

  constructor(dbName: string) {
    this.storage = new BrowserAtomDB(dbName);
  }

  async saveAtom(atom: Atom): Promise<void> {
    await this.storage.saveAtom(atom);
  }

  async getAtom(id: string): Promise<Atom | null> {
    return this.storage.getAtom(id);
  }

  async removeAtom(id: string): Promise<void> {
    await this.storage.removeAtom(id);
  }

  async getAllAtoms(): Promise<Atom[]> {
    return this.storage.getAllAtoms();
  }

  async clear(): Promise<void> {
    await this.storage.clear();
  }
}