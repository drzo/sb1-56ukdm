import { Atom } from '../../types/Atom';
import { AtomSpace } from '../../atomspace/core/AtomSpaceCore';
import { NetworkManager } from '../../network/NetworkManager';
import { Hash } from '../../cogutil/Hash';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

interface ConsistencyCheck {
  atomId: string;
  hash: string;
  timestamp: number;
}

export class ConsistencyManager {
  private atomspace: AtomSpace;
  private networkManager: NetworkManager;
  private consistencyChecks: Map<string, ConsistencyCheck>;
  private checkInterval: NodeJS.Timeout | null;
  private readonly checkIntervalMs = 10000;

  constructor(atomspace: AtomSpace) {
    this.atomspace = atomspace;
    this.networkManager = NetworkManager.getInstance();
    this.consistencyChecks = new Map();
    this.checkInterval = null;
  }

  async initialize(): Promise<void> {
    try {
      await this.performInitialCheck();
      this.startPeriodicChecks();
      Logger.info('ConsistencyManager initialized');
    } catch (error) {
      Logger.error('Failed to initialize ConsistencyManager:', error);
      throw error;
    }
  }

  private async performInitialCheck(): Promise<void> {
    const timer = new Timer();
    try {
      const atoms = this.atomspace.getAllAtoms();
      await Promise.all(atoms.map(atom => 
        this.checkAtomConsistency(atom)
      ));
      Logger.debug(`Initial consistency check completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to perform initial consistency check:', error);
      throw error;
    }
  }

  private startPeriodicChecks(): void {
    this.checkInterval = setInterval(
      () => this.performPeriodicCheck(),
      this.checkIntervalMs
    );
  }

  private async performPeriodicCheck(): Promise<void> {
    const timer = new Timer();
    try {
      const atoms = this.atomspace.getAllAtoms();
      const inconsistentAtoms = await Promise.all(
        atoms.map(async atom => {
          const isConsistent = await this.checkAtomConsistency(atom);
          return isConsistent ? null : atom;
        })
      );

      const atomsToFix = inconsistentAtoms.filter((atom): atom is Atom => atom !== null);
      if (atomsToFix.length > 0) {
        await this.resolveInconsistencies(atomsToFix);
      }

      Logger.debug(`Periodic consistency check completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Failed to perform periodic consistency check:', error);
    }
  }

  private async checkAtomConsistency(atom: Atom): Promise<boolean> {
    try {
      const localHash = this.calculateAtomHash(atom);
      const nodes = await this.networkManager.getAvailableNodes();
      
      const nodeHashes = await Promise.all(
        nodes.map(nodeId => 
          this.networkManager.requestAtomHash(nodeId, atom.getId())
        )
      );

      const consistentHashes = nodeHashes.filter(hash => hash === localHash);
      const isConsistent = consistentHashes.length === nodeHashes.length;

      this.consistencyChecks.set(atom.getId(), {
        atomId: atom.getId(),
        hash: localHash,
        timestamp: Date.now()
      });

      return isConsistent;
    } catch (error) {
      Logger.error(`Failed to check consistency for atom ${atom.getId()}:`, error);
      return false;
    }
  }

  private calculateAtomHash(atom: Atom): string {
    const atomData = {
      id: atom.getId(),
      type: atom.getType(),
      truthValue: atom.getTruthValue()
    };
    return Hash.murmur3(JSON.stringify(atomData)).toString();
  }

  private async resolveInconsistencies(atoms: Atom[]): Promise<void> {
    try {
      const nodes = await this.networkManager.getAvailableNodes();
      
      for (const atom of atoms) {
        const nodeVersions = await Promise.all(
          nodes.map(nodeId => 
            this.networkManager.requestAtom(nodeId, atom.getId())
          )
        );

        const validVersions = nodeVersions.filter((version): version is Atom => 
          version !== null
        );

        if (validVersions.length > 0) {
          // Use the most common version
          const versionMap = new Map<string, number>();
          validVersions.forEach(version => {
            const hash = this.calculateAtomHash(version);
            versionMap.set(hash, (versionMap.get(hash) || 0) + 1);
          });

          let mostCommonVersion: Atom | null = null;
          let maxCount = 0;

          for (const version of validVersions) {
            const hash = this.calculateAtomHash(version);
            const count = versionMap.get(hash) || 0;
            if (count > maxCount) {
              mostCommonVersion = version;
              maxCount = count;
            }
          }

          if (mostCommonVersion) {
            await this.atomspace.addAtom(mostCommonVersion);
          }
        }
      }
    } catch (error) {
      Logger.error('Failed to resolve inconsistencies:', error);
    }
  }

  async validateUpdate(atom: Atom): Promise<boolean> {
    try {
      const currentHash = this.calculateAtomHash(atom);
      const check = this.consistencyChecks.get(atom.getId());
      
      if (!check) return true;

      const timeSinceCheck = Date.now() - check.timestamp;
      if (timeSinceCheck > this.checkIntervalMs) {
        return true;
      }

      return currentHash === check.hash;
    } catch (error) {
      Logger.error(`Failed to validate update for atom ${atom.getId()}:`, error);
      return false;
    }
  }

  async checkConsistency(atomId: string, hash: string): Promise<boolean> {
    const atom = this.atomspace.getAtom(atomId);
    if (!atom) return false;

    const localHash = this.calculateAtomHash(atom);
    return localHash === hash;
  }

  async getConsistencyScore(): Promise<number> {
    try {
      const atoms = this.atomspace.getAllAtoms();
      const checks = await Promise.all(
        atoms.map(atom => this.checkAtomConsistency(atom))
      );

      const consistentCount = checks.filter(check => check).length;
      return atoms.length > 0 ? consistentCount / atoms.length : 1;
    } catch (error) {
      Logger.error('Failed to calculate consistency score:', error);
      return 0;
    }
  }

  async shutdown(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.consistencyChecks.clear();
  }
}