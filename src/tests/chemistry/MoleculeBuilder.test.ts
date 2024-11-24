import { describe, it, expect, beforeEach } from 'vitest';
import { AtomSpaceCore } from '../../atomspace/core/AtomSpaceCore';
import { MoleculeBuilder } from '../../chemistry/core/MoleculeBuilder';
import { ChemNodeType, ChemLinkType } from '../../chemistry/types/ChemTypes';

describe('MoleculeBuilder', () => {
  let atomspace: AtomSpaceCore;
  let builder: MoleculeBuilder;

  beforeEach(() => {
    atomspace = new AtomSpaceCore();
    builder = new MoleculeBuilder(atomspace);
  });

  it('should build molecule from SMILES', () => {
    const molecule = builder.buildFromSMILES('CCO'); // Ethanol
    expect(molecule).toBeDefined();
  });

  it('should calculate molecular properties', () => {
    const properties = builder.calculateMolecularProperties('CCO');
    expect(properties.formula).toBe('C2H6O');
    expect(properties.mass).toBeGreaterThan(0);
    expect(properties.charge).toBe(0);
  });

  it('should handle invalid SMILES', () => {
    expect(() => builder.buildFromSMILES('invalid')).toThrow();
  });
});