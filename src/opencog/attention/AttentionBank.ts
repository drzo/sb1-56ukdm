import { Atom } from '../../types/Atom';
import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import { Statistics } from '../../cogutil/Statistics';
import { LockFreeQueue } from '../../cogutil/concurrent/LockFreeQueue';

interface AttentionValue {
  sti: number;  // Short-term importance
  lti: number;  // Long-term importance
  vlti: boolean; // Very long-term importance
}

export class AttentionBank {
  private static instance: AttentionBank;
  private attentionValues: Map<string, AttentionValue>;
  private attentionUpdateQueue: LockFreeQueue<{
    atomId: string;
    update: Partial<AttentionValue>;
  }>;
  private readonly maxSTI: number = 100;
  private readonly minSTI: number = -100;

  private constructor() {
    this.attentionValues = new Map();
    this.attentionUpdateQueue = new LockFreeQueue(1000);
    this.startAttentionUpdater();
    Logger.info('AttentionBank initialized');
  }

  public static getInstance(): AttentionBank {
    if (!AttentionBank.instance) {
      AttentionBank.instance = new AttentionBank();
    }
    return AttentionBank.instance;
  }

  getAttentionValue(atom: Atom): AttentionValue {
    const av = this.attentionValues.get(atom.getId());
    if (!av) {
      return { sti: 0, lti: 0, vlti: false };
    }
    return { ...av };
  }

  async updateSTI(atom: Atom, delta: number): Promise<void> {
    const current = this.getAttentionValue(atom);
    const newSTI = Math.max(this.minSTI, Math.min(this.maxSTI, current.sti + delta));

    this.attentionUpdateQueue.enqueue({
      atomId: atom.getId(),
      update: { sti: newSTI }
    });
  }

  setLTI(atom: Atom, value: number): void {
    const current = this.getAttentionValue(atom);
    this.attentionValues.set(atom.getId(), {
      ...current,
      lti: value
    });
  }

  setVLTI(atom: Atom, value: boolean): void {
    const current = this.getAttentionValue(atom);
    this.attentionValues.set(atom.getId(), {
      ...current,
      vlti: value
    });
  }

  getTopSTIAtoms(limit: number = 10): Array<{ atom: Atom; av: AttentionValue }> {
    return Array.from(this.attentionValues.entries())
      .sort((a, b) => b[1].sti - a[1].sti)
      .slice(0, limit)
      .map(([atomId, av]) => ({
        atom: { getId: () => atomId } as Atom, // Placeholder
        av
      }));
  }

  private async startAttentionUpdater(): Promise<void> {
    while (true) {
      const update = this.attentionUpdateQueue.dequeue();
      if (update) {
        const current = this.attentionValues.get(update.atomId) || 
          { sti: 0, lti: 0, vlti: false };
        
        this.attentionValues.set(update.atomId, {
          ...current,
          ...update.update
        });
      }
      await Timer.sleep(10);
    }
  }

  getAttentionDistribution(): {
    meanSTI: number;
    stdDevSTI: number;
    totalAtoms: number;
  } {
    const stiValues = Array.from(this.attentionValues.values())
      .map(av => av.sti);

    return {
      meanSTI: Statistics.mean(stiValues),
      stdDevSTI: Statistics.standardDeviation(stiValues),
      totalAtoms: this.attentionValues.size
    };
  }
}