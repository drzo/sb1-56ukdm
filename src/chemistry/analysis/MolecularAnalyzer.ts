import { ChemNodeType, ChemLinkType } from '../types/ChemTypes';
import { AtomSpaceCore } from '../../atomspace/core/AtomSpaceCore';
import { Logger } from '../../cogutil/Logger';
import { Statistics } from '../../cogutil/Statistics';
import OCL from 'openchemlib';

export class MolecularAnalyzer {
  private atomspace: AtomSpaceCore;

  constructor(atomspace: AtomSpaceCore) {
    this.atomspace = atomspace;
  }

  analyzeBondDistribution(moleculeId: string) {
    try {
      const bonds = this.atomspace.getIncoming(this.atomspace.getAtom(moleculeId)!);
      const distribution = {
        [ChemLinkType.SINGLE_BOND]: 0,
        [ChemLinkType.DOUBLE_BOND]: 0,
        [ChemLinkType.TRIPLE_BOND]: 0,
        [ChemLinkType.AROMATIC_BOND]: 0
      };

      bonds.forEach(bond => {
        distribution[bond.getType() as ChemLinkType]++;
      });

      return distribution;
    } catch (error) {
      Logger.error('Failed to analyze bond distribution:', error);
      throw error;
    }
  }

  calculateSimilarity(smiles1: string, smiles2: string): number {
    try {
      const mol1 = OCL.Molecule.fromSmiles(smiles1);
      const mol2 = OCL.Molecule.fromSmiles(smiles2);
      
      const fp1 = mol1.getFingerprint();
      const fp2 = mol2.getFingerprint();
      
      return OCL.SSSearcher.getTanimotoSimilarity(fp1, fp2);
    } catch (error) {
      Logger.error('Failed to calculate molecular similarity:', error);
      throw error;
    }
  }

  findSubstructures(moleculeSmiles: string, substructureSmarts: string): number[] {
    try {
      const molecule = OCL.Molecule.fromSmiles(moleculeSmiles);
      const substructure = OCL.Molecule.fromSmarts(substructureSmarts);
      const searcher = new OCL.SSSearcher();
      
      searcher.setMolecule(molecule);
      searcher.setFragment(substructure);
      
      return searcher.findAll().map(match => match[0]);
    } catch (error) {
      Logger.error('Failed to find substructures:', error);
      throw error;
    }
  }

  predictReactivity(smiles: string): {
    electronegativity: number;
    reactiveGroups: string[];
    stericHindrance: number;
  } {
    try {
      const molecule = OCL.Molecule.fromSmiles(smiles);
      const reactiveGroups = this.identifyReactiveGroups(molecule);
      
      return {
        electronegativity: this.calculateAverageElectronegativity(molecule),
        reactiveGroups,
        stericHindrance: this.calculateStericHindrance(molecule)
      };
    } catch (error) {
      Logger.error('Failed to predict reactivity:', error);
      throw error;
    }
  }

  private identifyReactiveGroups(molecule: any): string[] {
    const reactiveGroups = [];
    const smartsPatterns = {
      'hydroxyl': '[OH]',
      'carboxyl': '[C](=O)[OH]',
      'amine': '[NH2]',
      'carbonyl': '[C]=O',
      'alkene': '[C]=[C]'
    };

    for (const [group, smarts] of Object.entries(smartsPatterns)) {
      if (this.findSubstructures(molecule.toSmiles(), smarts).length > 0) {
        reactiveGroups.push(group);
      }
    }

    return reactiveGroups;
  }

  private calculateAverageElectronegativity(molecule: any): number {
    const electronegativities: { [key: string]: number } = {
      'C': 2.55,
      'H': 2.2,
      'O': 3.44,
      'N': 3.04,
      'F': 3.98,
      'Cl': 3.16
    };

    let total = 0;
    let count = 0;

    for (let i = 0; i < molecule.getAllAtoms(); i++) {
      const symbol = molecule.getAtomLabel(i);
      if (electronegativities[symbol]) {
        total += electronegativities[symbol];
        count++;
      }
    }

    return count > 0 ? total / count : 0;
  }

  private calculateStericHindrance(molecule: any): number {
    let hindrance = 0;

    for (let i = 0; i < molecule.getAllAtoms(); i++) {
      const neighbors = molecule.getConnAtoms(i);
      const atomicNumber = molecule.getAtomicNo(i);
      
      // Higher atomic numbers and more neighbors increase steric hindrance
      hindrance += (atomicNumber * 0.1) * (neighbors * 0.5);
    }

    return Math.min(hindrance, 10); // Normalize to 0-10 scale
  }
}