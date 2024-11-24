import { Atom } from '../../types';

export class DistributedStore {
  constructor(
    private localAtomSpace: Map<string, Atom>,
    private remoteStores: Map<string, RemoteAtomSpace>
  ) {}

  async distribute(atom: Atom): Promise<void> {
    // Store locally first
    this.localAtomSpace.set(atom.id, atom);

    // Replicate important atoms
    if (this.shouldReplicate(atom)) {
      await this.replicateToRemotes(atom);
    }
  }

  async retrieve(id: string): Promise<Atom | undefined> {
    // Check local cache first
    const localAtom = this.localAtomSpace.get(id);
    if (localAtom) return localAtom;

    // Try remote stores
    return await this.retrieveFromRemotes(id);
  }

  private shouldReplicate(atom: Atom): boolean {
    return atom.attention !== undefined && 
           atom.attention.sti > 50;
  }

  private async replicateToRemotes(atom: Atom): Promise<void> {
    const replicationPromises = Array.from(this.remoteStores.values())
      .map(store => store.storeAtom(atom));
    
    await Promise.all(replicationPromises);
  }

  private async retrieveFromRemotes(id: string): Promise<Atom | undefined> {
    for (const store of this.remoteStores.values()) {
      try {
        const remoteAtom = await store.getAtom(id);
        if (remoteAtom) {
          this.localAtomSpace.set(id, remoteAtom);
          return remoteAtom;
        }
      } catch (error) {
        console.error(`Failed to retrieve from remote store: ${error}`);
      }
    }
  }
}

interface RemoteAtomSpace {
  storeAtom(atom: Atom): Promise<void>;
  getAtom(id: string): Promise<Atom | undefined>;
}