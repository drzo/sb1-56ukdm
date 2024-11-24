import { describe, it, expect } from 'vitest';
import { SequenceAnalyzer } from '../../bio/analysis/SequenceAnalyzer';

describe('SequenceAnalyzer', () => {
  it('should calculate GC content correctly', () => {
    const sequence = 'ATGCCGTA';
    expect(SequenceAnalyzer.calculateGCContent(sequence)).toBe(0.5);
  });

  it('should find motifs in sequence', () => {
    const sequence = 'ATGATGATG';
    const positions = SequenceAnalyzer.findMotif(sequence, 'ATG');
    expect(positions).toEqual([0, 3, 6]);
  });

  it('should translate DNA to protein', () => {
    const dna = 'ATGGCCTAT';
    const protein = SequenceAnalyzer.translateDNA(dna);
    expect(protein).toBe('MAY');
  });

  it('should calculate sequence similarity', () => {
    const seq1 = 'ATGC';
    const seq2 = 'ATGG';
    expect(SequenceAnalyzer.calculateSequenceSimilarity(seq1, seq2)).toBe(0.75);
  });

  it('should find repeats in sequence', () => {
    const sequence = 'ATGATGATG';
    const repeats = SequenceAnalyzer.findRepeats(sequence, 3);
    expect(repeats.has('ATG')).toBe(true);
    expect(repeats.get('ATG')?.length).toBe(3);
  });

  it('should analyze codon usage', () => {
    const sequence = 'ATGGCCTAT';
    const codonCounts = SequenceAnalyzer.analyzeCodons(sequence);
    expect(codonCounts.get('ATG')).toBe(1);
    expect(codonCounts.get('GCC')).toBe(1);
    expect(codonCounts.get('TAT')).toBe(1);
  });
});