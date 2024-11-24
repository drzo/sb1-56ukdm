import { Atom } from '../../../types';
import { ECANConfig } from '../config/ecan-config';
import { AttentionDynamics } from './attention-dynamics';
import { ImportanceSpreading } from './importance-spreading';
import { TournamentSelection } from './tournament-selection';
import { HebbianLearning } from './hebbian-learning';
import { ForgettingManager } from './forgetting/forgetting-manager';
import { RentCollector } from './rent/rent-collector';

export class ECANAgent {
  private dynamics: AttentionDynamics;
  private spreading: ImportanceSpreading;
  private selection: TournamentSelection;
  private hebbianLearning: HebbianLearning;
  private forgetting: ForgettingManager;
  private rent: RentCollector;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {
    this.dynamics = new AttentionDynamics(config);
    this.spreading = new ImportanceSpreading(atomSpace, config);
    this.selection = new TournamentSelection(config);
    this.hebbianLearning = new HebbianLearning(config);
    this.forgetting = new ForgettingManager(config);
    this.rent = new RentCollector(config);
  }

  step(): void {
    const atoms = Array.from(this.atomSpace.values());
    
    // 1. Collect and redistribute rent
    const rentUpdates = this.rent.collectAndRedistribute(atoms);
    
    // 2. Update Hebbian links
    const hebbianUpdates = this.updateHebbianLinks(atoms);
    
    // 3. Select atoms for importance spreading
    const selectedAtoms = this.selection.selectAtoms(
      atoms,
      Math.ceil(atoms.length * 0.1)
    );

    // 4. Spread importance from selected atoms
    const spreadUpdates = new Map<string, Atom>();
    selectedAtoms.forEach(atom => {
      const updates = this.spreading.spreadImportance(atom);
      updates.forEach((av, id) => {
        const atom = this.atomSpace.get(id);
        if (atom) {
          spreadUpdates.set(id, { ...atom, attention: av });
        }
      });
    });

    // 5. Apply all updates
    this.applyUpdates(atoms, rentUpdates, hebbianUpdates, spreadUpdates);

    // 6. Handle forgetting
    const atomsToForget = this.forgetting.selectAtomsToForget(atoms);
    atomsToForget.forEach(atom => {
      this.atomSpace.delete(atom.id);
    });
  }

  private updateHebbianLinks(atoms: Atom[]): Map<string, Atom> {
    // Find co-activated atom pairs
    const coActivatedPairs = this.findCoActivatedPairs(atoms);
    
    // Update or create Hebbian links
    const updates = new Map<string, Atom>();
    
    coActivatedPairs.forEach(([source, target]) => {
      const existingLink = this.findHebbianLink(atoms, source, target);
      const updatedLink = this.hebbianLearning.updateHebbianLink(
        source,
        target,
        existingLink
      );
      updates.set(updatedLink.id, updatedLink);
    });

    return updates;
  }

  private findCoActivatedPairs(atoms: Atom[]): [Atom, Atom][] {
    const pairs: [Atom, Atom][] = [];
    const activeAtoms = atoms.filter(atom => 
      atom.attention && atom.attention.sti > 0
    );

    for (let i = 0; i < activeAtoms.length; i++) {
      for (let j = i + 1; j < activeAtoms.length; j++) {
        if (this.areCoActivated(activeAtoms[i], activeAtoms[j])) {
          pairs.push([activeAtoms[i], activeAtoms[j]]);
        }
      }
    }

    return pairs;
  }

  private areCoActivated(atom1: Atom, atom2: Atom): boolean {
    if (!atom1.attention || !atom2.attention) return false;
    
    const normalizedSTI1 = (atom1.attention.sti + 100) / 200;
    const normalizedSTI2 = (atom2.attention.sti + 100) / 200;
    
    return normalizedSTI1 > 0.5 && normalizedSTI2 > 0.5;
  }

  private findHebbianLink(atoms: Atom[], source: Atom, target: Atom): Atom | undefined {
    return atoms.find(atom =>
      atom.type === 'HebbianLink' &&
      atom.outgoing?.includes(source.id) &&
      atom.outgoing?.includes(target.id)
    );
  }

  private applyUpdates(...updates: Map<string, Atom>[]): void {
    const finalUpdates = new Map<string, Atom>();
    
    updates.forEach(updateMap => {
      updateMap.forEach((atom, id) => {
        const existing = finalUpdates.get(id);
        if (existing) {
          finalUpdates.set(id, this.mergeAtomUpdates(existing, atom));
        } else {
          finalUpdates.set(id, atom);
        }
      });
    });

    finalUpdates.forEach((atom, id) => {
      this.atomSpace.set(id, atom);
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
      } : atom2.attention,
      truthValue: atom2.truthValue || atom1.truthValue
    };
  }

  // Public methods for external interaction
  stimulateAtom(atom: Atom, stimulus: number): void {
    if (!atom.attention) return;

    const updatedAV = this.dynamics.updateSTI(atom.attention, stimulus);
    atom.attention = this.dynamics.normalizeAttention(updatedAV);
  }

  getImportantAtoms(count: number): Atom[] {
    return this.selection.selectAtoms(
      Array.from(this.atomSpace.values()),
      count
    );
  }
}