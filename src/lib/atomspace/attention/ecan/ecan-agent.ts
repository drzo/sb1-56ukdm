import { Atom, AttentionValue } from '../../types';
import { ECANConfig, defaultECANConfig } from './ecan-config';
import { AttentionDynamics } from './attention-dynamics';
import { ImportanceSpreading } from './importance-spreading';
import { TournamentSelection } from './tournament-selection';
import { HebbianLearning } from './hebbian-learning';
import { AttentionAllocation } from './attention-allocation';
import { ForgettingMechanism } from './forgetting';
import { AttentionRent } from './rent';
import { StimulusProcessor } from './stimulus';

export class ECANAgent {
  private dynamics: AttentionDynamics;
  private spreading: ImportanceSpreading;
  private selection: TournamentSelection;
  private hebbianLearning: HebbianLearning;
  private allocation: AttentionAllocation;
  private forgetting: ForgettingMechanism;
  private rent: AttentionRent;
  private stimulus: StimulusProcessor;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig = defaultECANConfig
  ) {
    this.dynamics = new AttentionDynamics(this.config);
    this.spreading = new ImportanceSpreading(atomSpace, this.config);
    this.selection = new TournamentSelection(this.config);
    this.hebbianLearning = new HebbianLearning(this.config);
    this.allocation = new AttentionAllocation(this.config);
    this.forgetting = new ForgettingMechanism(this.config);
    this.rent = new AttentionRent(this.config);
    this.stimulus = new StimulusProcessor(this.config);
  }

  step(): void {
    const atoms = Array.from(this.atomSpace.values());
    
    // 1. Collect rent from atoms
    const rentUpdates = this.rent.collectRent(atoms);
    const totalRent = Array.from(rentUpdates.values())
      .reduce((sum, av) => sum + av.sti, 0);

    // 2. Redistribute collected rent
    const rentRedistribution = this.rent.redistributeRent(totalRent, atoms);

    // 3. Apply forgetting mechanism
    const atomsToForget = this.forgetting.selectAtomsToForget(
      atoms,
      Math.floor(atoms.length * 0.05) // Remove up to 5% of atoms
    );

    // 4. Update Hebbian links
    this.updateHebbianLinks();

    // 5. Select atoms for importance spreading
    const selectedAtoms = this.selection.selectAtoms(
      atoms,
      Math.ceil(atoms.length * 0.1)
    );

    // 6. Spread importance from selected atoms
    const spreadUpdates = new Map<string, AttentionValue>();
    selectedAtoms.forEach(atom => {
      const updates = this.spreading.spreadImportance(atom);
      updates.forEach((av, id) => spreadUpdates.set(id, av));
    });

    // 7. Apply all updates
    this.applyAttentionUpdates(
      atoms,
      rentUpdates,
      rentRedistribution,
      spreadUpdates
    );

    // 8. Remove forgotten atoms
    atomsToForget.forEach(atom => {
      this.atomSpace.delete(atom.id);
    });
  }

  private applyAttentionUpdates(
    atoms: Atom[],
    ...updates: Map<string, AttentionValue>[]
  ): void {
    // Merge all updates
    const finalUpdates = new Map<string, AttentionValue>();
    
    updates.forEach(updateMap => {
      updateMap.forEach((av, id) => {
        const existing = finalUpdates.get(id);
        if (existing) {
          finalUpdates.set(id, {
            sti: av.sti + existing.sti,
            lti: Math.max(av.lti, existing.lti),
            vlti: av.vlti || existing.vlti
          });
        } else {
          finalUpdates.set(id, av);
        }
      });
    });

    // Apply updates to atoms
    finalUpdates.forEach((av, id) => {
      const atom = this.atomSpace.get(id);
      if (atom) {
        atom.attention = this.dynamics.normalizeAttention(av);
      }
    });
  }

  // ... rest of the existing methods ...
}