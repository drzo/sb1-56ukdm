import { describe, it, expect, beforeEach } from 'vitest';
import { BioAtomSpace } from '../../bio/core/BioAtomSpace';
import { PathwayAnalyzer } from '../../bio/analysis/PathwayAnalyzer';
import { BioNodeType } from '../../bio/types/BioTypes';

describe('PathwayAnalyzer', () => {
  let bioAtomSpace: BioAtomSpace;
  let analyzer: PathwayAnalyzer;

  beforeEach(() => {
    bioAtomSpace = new BioAtomSpace();
    analyzer = new PathwayAnalyzer(bioAtomSpace);

    // Set up test data
    const gene1 = bioAtomSpace.addGene({ symbol: 'GENE1', name: 'Gene 1', organism: 'Human' });
    const gene2 = bioAtomSpace.addGene({ symbol: 'GENE2', name: 'Gene 2', organism: 'Human' });
    const pathway = bioAtomSpace.addPathway({
      id: 'P1',
      name: 'Test Pathway',
      participants: [gene1.getId(), gene2.getId()]
    });
  });

  it('should find enriched pathways', () => {
    const enriched = analyzer.findEnrichedPathways(['GENE1', 'GENE2']);
    expect(enriched.size).toBeGreaterThan(0);
  });

  it('should find connected pathways', () => {
    const pathway2 = bioAtomSpace.addPathway({
      id: 'P2',
      name: 'Connected Pathway',
      participants: ['GENE1']
    });

    const connected = analyzer.findConnectedPathways('P1');
    expect(connected).toHaveLength(1);
    expect(connected[0].getId()).toBe('P2');
  });

  it('should calculate pathway overlap', () => {
    const pathway2 = bioAtomSpace.addPathway({
      id: 'P2',
      name: 'Overlapping Pathway',
      participants: ['GENE1']
    });

    const overlap = analyzer.calculatePathwayOverlap('P1', 'P2');
    expect(overlap).toBeGreaterThan(0);
    expect(overlap).toBeLessThan(1);
  });
});