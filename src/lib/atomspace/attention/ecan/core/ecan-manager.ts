import { Atom } from '../../../types';
import { ECANConfig } from '../config/ecan-config';
import { AttentionAllocation } from './attention-allocation';
import { ImportanceDiffusion } from './importance-diffusion';
import { HebbianUpdater } from './hebbian-updater';
import { ForgettingManager } from './forgetting-manager';
import { RentCollector } from './rent-collector';
import { StimulusHandler } from './stimulus-handler';

export class ECANManager {
  private attentionAllocation: AttentionAllocation;
  private importanceDiffusion: ImportanceDiffusion;
  private hebbianUpdater: HebbianUpdater;
  private forgettingManager: ForgettingManager;
  private rentCollector: RentCollector;
  private stimulusHandler: StimulusHandler;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {
    this.attentionAllocation = new AttentionAllocation(config);
    this.importanceDiffusion = new ImportanceDiffusion(atomSpace, config);
    this.hebbianUpdater = new HebbianUpdater(config);
    this.forgettingManager = new ForgettingManager(config);
    this.rentCollector = new RentCollector(config);
    this.stimulusHandler = new StimulusHandler(config);
  }

  step(): void {
    const atoms = Array.from(this.atomSpace.values());
    
    // 1. Collect and redistribute rent
    const rentUpdates = this.rentCollector.collectAndRedistribute(atoms);
    
    // 2. Update Hebbian links
    const hebbianUpdates = this.hebbianUpdater.updateLinks(atoms);
    
    // 3. Diffuse importance
    const diffusionUpdates = this.importanceDiffusion.diffuseImportance(atoms);
    
    // 4. Handle forgetting
    const atomsToForget = this.forgettingManager.selectAtomsToForget(atoms);
    
    // 5. Apply all updates
    this.applyUpdates(atoms, rentUpdates, hebbianUpdates, diffusionUpdates);
    
    // 6. Remove forgotten atoms
    this.removeAtoms(atomsToForget);
  }

  private applyUpdates(atoms: Atom[], ...updates: Map<string, Atom>[]): void {
    const finalUpdates = new Map<string, Atom>();
    
    updates.forEach(updateMap => {
      updateMap.forEach((updatedAtom, id) => {
        const existing = finalUpdates.get(id);
        if (existing) {
          finalUpdates.set(id, this.mergeAtomUpdates(existing, updatedAtom));
        } else {
          finalUpdates.set(id, updatedAtom);
        }
      });
    });

    finalUpdates.forEach((updatedAtom, id) => {
      this.atomSpace.set(id, updatedAtom);
    });
  }

  private mergeAtomUpdates(atom1: Atom, atom2: Atom): Atom {
    return {
      ...atom1,
      ...atom2,
      attention: atom1.attention && atom2.attention ? {
        sti: atom2.attention.sti,
        lti: Math.max(atom1.attention.lti, atom2.attention.lti),
        vlti: atom1.attention.vlti || atom2.attention.vlti
      } : atom2.attention
    };
  }

  private removeAtoms(atomsToRemove: Atom[]): void {
    atomsToRemove.forEach(atom => {
      this.atomSpace.delete(atom.id);
    });
  }

  // Public methods for external interaction
  stimulateAtom(atom: Atom, stimulus: number, context?: Atom): void {
    const updatedAtom = this.stimulusHandler.handleStimulus(atom, stimulus, context);
    this.atomSpace.set(atom.id, updatedAtom);
  }

  getImportantAtoms(count: number): Atom[] {
    return this.attentionAllocation.getTopAttentionAtoms(
      Array.from(this.atomSpace.values()),
      count
    );
  }
}