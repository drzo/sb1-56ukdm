import { Atom } from '../../../types';
import { ECANConfig } from '../config/ecan-config';
import { ImportanceDiffusion } from './importance/importance-diffusion';
import { ImportanceUpdating } from './importance/importance-updating';
import { ImportanceSelection } from './importance/importance-selection';

export class ImportanceManager {
  private diffusion: ImportanceDiffusion;
  private updating: ImportanceUpdating;
  private selection: ImportanceSelection;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {
    this.diffusion = new ImportanceDiffusion(atomSpace, config);
    this.updating = new ImportanceUpdating(config);
    this.selection = new ImportanceSelection(config);
  }

  spreadImportance(atoms: Atom[]): Map<string, Atom> {
    // 1. Select atoms for importance spreading
    const selectedAtoms = this.selection.selectAtoms(atoms);
    
    // 2. Update importance values
    const updatedAtoms = this.updating.updateImportance(selectedAtoms);
    
    // 3. Diffuse importance through the network
    return this.diffusion.diffuseImportance(updatedAtoms);
  }

  getImportantAtoms(count: number): Atom[] {
    return this.selection.getTopAtoms(
      Array.from(this.atomSpace.values()),
      count
    );
  }
}