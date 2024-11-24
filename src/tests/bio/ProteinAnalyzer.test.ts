import { describe, it, expect, beforeEach } from 'vitest';
import { BioAtomSpace } from '../../bio/core/BioAtomSpace';
import { ProteinAnalyzer } from '../../bio/analysis/ProteinAnalyzer';

describe('ProteinAnalyzer', () => {
  let bioAtomSpace: BioAtomSpace;
  let analyzer: ProteinAnalyzer;

  beforeEach(() => {
    bioAtomSpace = new BioAtomSpace();
    analyzer = new ProteinAnalyzer(bioAtomSpace);

    // Set up test data
    const protein1 = bioAtomSpace.addProtein({
      id: 'P1',
      name: 'Protein 1',
      gene: 'GENE1'
    });

    const protein2 = bioAtomSpace.addProtein({
      id: 'P2',
      name: 'Protein 2',
      gene: 'GENE2'
    });
  });

  it('should find protein interactions', () => {
    const interactions = analyzer.findProteinInteractions('P1');
    expect(interactions).toBeDefined();
    expect(interactions instanceof Map).toBe(true);
  });

  it('should find protein complexes', () => {
    const complexes = analyzer.findProteinComplexes(2);
    expect(Array.isArray(complexes)).toBe(true);
    expect(complexes.every(Array.isArray)).toBe(true);
  });

  it('should calculate protein similarity', () => {
    const similarity = analyzer.calculateProteinSimilarity('P1', 'P2');
    expect(similarity).toBeGreaterThanOrEqual(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it('should find functional partners', () => {
    const partners = analyzer.findFunctionalPartners('P1', 0.5);
    expect(Array.isArray(partners)).toBe(true);
  });
});