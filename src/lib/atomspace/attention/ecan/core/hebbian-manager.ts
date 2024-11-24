import { Atom } from '../../../types';
import { ECANConfig } from '../config/ecan-config';
import { HebbianLearning } from './hebbian/hebbian-learning';
import { HebbianDecay } from './hebbian/hebbian-decay';
import { HebbianCreation } from './hebbian/hebbian-creation';

export class HebbianManager {
  private learning: HebbianLearning;
  private decay: HebbianDecay;
  private creation: HebbianCreation;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {
    this.learning = new HebbianLearning(config);
    this.decay = new HebbianDecay(config);
    this.creation = new HebbianCreation(atomSpace, config);
  }

  updateHebbianLinks(atoms: Atom[]): Map<string, Atom> {
    // 1. Create new Hebbian links where appropriate
    const newLinks = this.creation.createHebbianLinks(atoms);
    
    // 2. Update existing Hebbian links through learning
    const updatedLinks = this.learning.updateLinks(atoms);
    
    // 3. Apply decay to Hebbian links
    const decayedLinks = this.decay.decayLinks(
      this.getHebbianLinks([...newLinks.values(), ...updatedLinks.values()])
    );
    
    return this.mergeUpdates(newLinks, updatedLinks, decayedLinks);
  }

  private getHebbianLinks(atoms: Atom[]): Atom[] {
    return atoms.filter(atom => atom.type === 'HebbianLink');
  }

  private mergeUpdates(...updates: Map<string, Atom>[]): Map<string, Atom> {
    const merged = new Map<string, Atom>();
    
    updates.forEach(updateMap => {
      updateMap.forEach((atom, id) => merged.set(id, atom));
    });

    return merged;
  }
}