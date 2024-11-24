import { ChemNodeType, ChemLinkType, MoleculeInfo } from '../types/ChemTypes';
import { AtomSpaceCore } from '../../atomspace/core/AtomSpaceCore';
import { Logger } from '../../cogutil/Logger';

export class MoleculeBuilder {
  private atomspace: AtomSpaceCore;

  constructor(atomspace: AtomSpaceCore) {
    this.atomspace = atomspace;
  }

  buildFromSMILES(smiles: string) {
    try {
      // Parse SMILES using simplified approach
      const atoms = this.parseAtoms(smiles);
      const bonds = this.parseBonds(smiles);
      const atomMap = new Map();

      // Add atoms
      atoms.forEach((atom, i) => {
        const atomNode = this.atomspace.addNode(ChemNodeType.ATOM, atom);
        atomMap.set(i, atomNode);
      });

      // Add bonds
      bonds.forEach(bond => {
        const atom1 = atomMap.get(bond.begin);
        const atom2 = atomMap.get(bond.end);
        
        this.atomspace.addLink(bond.type, [atom1, atom2]);
      });

      Logger.info(`Built molecule from SMILES: ${smiles}`);
      return { atoms, bonds };
    } catch (error) {
      Logger.error('Failed to build molecule from SMILES:', error);
      throw error;
    }
  }

  calculateMolecularProperties(smiles: string): MoleculeInfo {
    try {
      const { atoms, bonds } = this.buildFromSMILES(smiles);
      
      return {
        formula: this.calculateFormula(atoms),
        smiles: smiles,
        mass: this.calculateMass(atoms),
        charge: this.calculateTotalCharge(atoms),
        bonds: this.getBondInfo(bonds)
      };
    } catch (error) {
      Logger.error('Failed to calculate molecular properties:', error);
      throw error;
    }
  }

  private parseAtoms(smiles: string): string[] {
    const atoms: string[] = [];
    const atomRegex = /([A-Z][a-z]?)/g;
    let match;
    
    while ((match = atomRegex.exec(smiles)) !== null) {
      atoms.push(match[1]);
    }
    
    return atoms;
  }

  private parseBonds(smiles: string): Array<{
    begin: number;
    end: number;
    type: ChemLinkType;
    order: number;
  }> {
    const bonds: Array<{
      begin: number;
      end: number;
      type: ChemLinkType;
      order: number;
    }> = [];
    
    let currentAtom = 0;
    
    for (let i = 0; i < smiles.length - 1; i++) {
      if (this.isAtom(smiles[i]) && this.isAtom(smiles[i + 1])) {
        bonds.push({
          begin: currentAtom,
          end: currentAtom + 1,
          type: ChemLinkType.SINGLE_BOND,
          order: 1
        });
      } else if (smiles[i] === '=' && this.isAtom(smiles[i - 1]) && this.isAtom(smiles[i + 1])) {
        bonds.push({
          begin: currentAtom - 1,
          end: currentAtom,
          type: ChemLinkType.DOUBLE_BOND,
          order: 2
        });
      } else if (smiles[i] === '#' && this.isAtom(smiles[i - 1]) && this.isAtom(smiles[i + 1])) {
        bonds.push({
          begin: currentAtom - 1,
          end: currentAtom,
          type: ChemLinkType.TRIPLE_BOND,
          order: 3
        });
      }
      
      if (this.isAtom(smiles[i])) {
        currentAtom++;
      }
    }
    
    return bonds;
  }

  private isAtom(char: string): boolean {
    return /[A-Z]/.test(char);
  }

  private calculateFormula(atoms: string[]): string {
    const elements = new Map<string, number>();
    
    atoms.forEach(atom => {
      elements.set(atom, (elements.get(atom) || 0) + 1);
    });

    return Array.from(elements.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([element, count]) => `${element}${count > 1 ? count : ''}`)
      .join('');
  }

  private calculateMass(atoms: string[]): number {
    const atomicMasses: { [key: string]: number } = {
      'H': 1.008, 'C': 12.011, 'N': 14.007, 'O': 15.999, 'F': 18.998,
      'P': 30.974, 'S': 32.065, 'Cl': 35.453, 'Br': 79.904, 'I': 126.904
    };

    return atoms.reduce((mass, atom) => 
      mass + (atomicMasses[atom] || 0), 0);
  }

  private calculateTotalCharge(atoms: string[]): number {
    // Simplified charge calculation
    return 0;
  }

  private getBondInfo(bonds: Array<{
    type: ChemLinkType;
    order: number;
  }>): any[] {
    return bonds.map(bond => ({
      type: bond.type,
      order: bond.order,
      length: 1.5, // Default bond length in Angstroms
      energy: this.calculateBondEnergy(bond)
    }));
  }

  private calculateBondEnergy(bond: { order: number }): number {
    // Simplified bond energy calculation
    const baseEnergy = 350; // kJ/mol for single bond
    return baseEnergy * bond.order;
  }
}