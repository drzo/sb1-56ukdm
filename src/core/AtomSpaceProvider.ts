import { AtomSpace } from './AtomSpaceCore';
import { QueryEngine } from '../query/QueryEngine';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';

export class AtomSpaceProvider {
  private static instance: AtomSpaceProvider | null = null;
  private atomspace: AtomSpace;
  private queryEngine: QueryEngine;

  private constructor() {
    this.atomspace = new AtomSpace();
    this.queryEngine = new QueryEngine(this.atomspace);
    Logger.info('AtomSpaceProvider initialized');
  }

  public static getInstance(): AtomSpaceProvider {
    if (!AtomSpaceProvider.instance) {
      AtomSpaceProvider.instance = new AtomSpaceProvider();
    }
    return AtomSpaceProvider.instance;
  }

  public getAtomSpace(): AtomSpace {
    return this.atomspace;
  }

  public getQueryEngine(): QueryEngine {
    return this.queryEngine;
  }

  public getStats(): { atomCount: number; nodeCount: number; linkCount: number } {
    const timer = new Timer();
    const atoms = this.atomspace.getAllAtoms();
    const stats = {
      atomCount: atoms.length,
      nodeCount: atoms.filter(a => a instanceof Node).length,
      linkCount: atoms.filter(a => a instanceof Link).length
    };
    Logger.debug(`Stats retrieved in ${timer.stop()}ms`, stats);
    return stats;
  }
}