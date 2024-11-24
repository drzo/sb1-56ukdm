import { Logger } from '../../cogutil/Logger';
import { Statistics } from '../../cogutil/Statistics';

export class SequenceAnalyzer {
  static calculateGCContent(sequence: string): number {
    const gc = (sequence.match(/[GC]/gi) || []).length;
    return gc / sequence.length;
  }

  static findMotif(sequence: string, motif: string): number[] {
    const positions: number[] = [];
    let pos = sequence.indexOf(motif);
    while (pos !== -1) {
      positions.push(pos);
      pos = sequence.indexOf(motif, pos + 1);
    }
    return positions;
  }

  static translateDNA(sequence: string): string {
    const codonTable: { [key: string]: string } = {
      'ATA': 'I', 'ATC': 'I', 'ATT': 'I', 'ATG': 'M',
      'ACA': 'T', 'ACC': 'T', 'ACG': 'T', 'ACT': 'T',
      'AAC': 'N', 'AAT': 'N', 'AAA': 'K', 'AAG': 'K',
      'AGC': 'S', 'AGT': 'S', 'AGA': 'R', 'AGG': 'R',
      'CTA': 'L', 'CTC': 'L', 'CTG': 'L', 'CTT': 'L',
      'CCA': 'P', 'CCC': 'P', 'CCG': 'P', 'CCT': 'P',
      'CAC': 'H', 'CAT': 'H', 'CAA': 'Q', 'CAG': 'Q',
      'CGA': 'R', 'CGC': 'R', 'CGG': 'R', 'CGT': 'R',
      'GTA': 'V', 'GTC': 'V', 'GTG': 'V', 'GTT': 'V',
      'GCA': 'A', 'GCC': 'A', 'GCG': 'A', 'GCT': 'A',
      'GAC': 'D', 'GAT': 'D', 'GAA': 'E', 'GAG': 'E',
      'GGA': 'G', 'GGC': 'G', 'GGG': 'G', 'GGT': 'G',
      'TCA': 'S', 'TCC': 'S', 'TCG': 'S', 'TCT': 'S',
      'TTC': 'F', 'TTT': 'F', 'TTA': 'L', 'TTG': 'L',
      'TAC': 'Y', 'TAT': 'Y', 'TAA': '*', 'TAG': '*',
      'TGC': 'C', 'TGT': 'C', 'TGA': '*', 'TGG': 'W',
    };

    let protein = '';
    try {
      for (let i = 0; i < sequence.length; i += 3) {
        const codon = sequence.slice(i, i + 3).toUpperCase();
        if (codon.length === 3) {
          protein += codonTable[codon] || 'X';
        }
      }
    } catch (error) {
      Logger.error('Error translating DNA sequence:', error);
      throw error;
    }
    return protein;
  }

  static calculateSequenceSimilarity(seq1: string, seq2: string): number {
    const length = Math.min(seq1.length, seq2.length);
    let matches = 0;
    
    for (let i = 0; i < length; i++) {
      if (seq1[i] === seq2[i]) matches++;
    }
    
    return matches / length;
  }

  static findRepeats(sequence: string, minLength: number = 3): Map<string, number[]> {
    const repeats = new Map<string, number[]>();
    
    for (let i = 0; i < sequence.length - minLength + 1; i++) {
      for (let len = minLength; len <= Math.min(20, sequence.length - i); len++) {
        const subseq = sequence.slice(i, i + len);
        const positions = this.findMotif(sequence, subseq);
        
        if (positions.length > 1) {
          repeats.set(subseq, positions);
        }
      }
    }
    
    return repeats;
  }

  static analyzeCodons(sequence: string): Map<string, number> {
    const codonCounts = new Map<string, number>();
    
    for (let i = 0; i < sequence.length - 2; i += 3) {
      const codon = sequence.slice(i, i + 3).toUpperCase();
      if (codon.length === 3) {
        codonCounts.set(codon, (codonCounts.get(codon) || 0) + 1);
      }
    }
    
    return codonCounts;
  }
}