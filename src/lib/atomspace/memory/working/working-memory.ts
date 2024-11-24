import { Atom, AttentionValue, ECANConfig } from '../../types';
import { AttentionManager } from '../../attention/ecan/core/attention-manager';

export class WorkingMemory {
  constructor(
    private atomSpace: Map<string, Atom>,
    private attentionManager: AttentionManager,
    private config: ECANConfig
  ) {}

  getActiveAtoms(): Atom[] {
    return Array.from(this.atomSpace.values())
      .filter(atom => this.isActive(atom));
  }

  updateWorkingSet(atoms: Atom[]): Map<string, AttentionValue> {
    const updates = new Map<string, AttentionValue>();
    
    atoms.forEach(atom => {
      if (!atom.attention) return;
      
      const decayedSTI = this.calculateDecayedSTI(atom);
      const updatedAV = {
        ...atom.attention,
        sti: decayedSTI
      };

      updates.set(atom.id, updatedAV);
    });

    return updates;
  }

  focusAttention(atom: Atom): void {
    if (!atom.attention) return;
    
    this.attentionManager.stimulateAtom(atom, 10);
    this.spreadActivation(atom);
  }

  private isActive(atom: Atom): boolean {
    return atom.attention !== undefined && 
           atom.attention.sti > this.config.attentionThreshold;
  }

  private calculateDecayedSTI(atom: Atom): number {
    if (!atom.attention) return 0;
    return atom.attention.sti * (1 - this.config.attentionDecayRate);
  }

  private spreadActivation(source: Atom): void {
    const neighbors = this.getNeighbors(source);
    neighbors.forEach(neighbor => {
      this.attentionManager.stimulateAtom(neighbor, 5);
    });
  }

  private getNeighbors(atom: Atom): Atom[] {
    return Array.from(this.atomSpace.values())
      .filter(other => this.isConnected(atom, other));
  }

  private isConnected(a: Atom, b: Atom): boolean {
    return a.outgoing?.includes(b.id) || b.outgoing?.includes(a.id);
  }
}