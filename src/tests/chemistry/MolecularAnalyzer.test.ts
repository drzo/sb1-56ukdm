import { describe, it, expect, beforeEach } from 'vitest';
import { AtomSpaceCore } from '../../atomspace/core/AtomSpaceCore';
import { MolecularAnalyzer } from '../../chemistry/analysis/MolecularAnalyzer';

describe('MolecularAnalyzer', () => {
  let atomspace: AtomSpaceCore;
  let analyzer: MolecularAnalyzer;

  beforeEach(() => {
    atomspace = new AtomSpaceCore();
    analyzer = new MolecularAnalyzer(atomspace);
  });

  it('should calculate molecular similarity', () => {
    const similarity = analyzer.calculateSimilarity('CCO', 'CCCO');
    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it('should find substructures', () => {
    const matches = analyzer.findSubstructures('CCCC', 'CC');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('should predict reactivity', () => {
    const reactivity = analyzer.predictReactivity('CCO');
    expect(reactivity.electronegativity).toBeGreaterThan(0);
    expect(Array.isArray(reactivity.reactiveGroups)).toBe(true);
    expect(reactivity.stericHindrance).toBeGreaterThanOrEqual(0);
  });
});