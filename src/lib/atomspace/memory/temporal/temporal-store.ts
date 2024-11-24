import { Atom } from '../../types';
import { EpisodicMemory } from '../episodic/episodic-memory';
import { ProceduralMemory } from '../procedural/procedural-memory';

export class TemporalStore {
  constructor(
    private episodicMemory: EpisodicMemory,
    private proceduralMemory: ProceduralMemory,
    private atomSpace: Map<string, Atom>
  ) {}

  storeSequence(sequence: Atom[]): void {
    const temporalLinks = this.createTemporalLinks(sequence);
    
    this.episodicMemory.addTemporalContext(temporalLinks);
    
    if (this.isProcedural(sequence)) {
      this.proceduralMemory.learnProcedure(sequence);
    }
  }

  predictNext(currentState: Atom): Atom[] {
    const patterns = this.findTemporalPatterns(currentState);
    return this.rankPredictions(patterns);
  }

  private createTemporalLinks(sequence: Atom[]): TemporalLink[] {
    return sequence.map((atom, i) => ({
      source: atom,
      target: sequence[i + 1],
      timestamp: Date.now(),
      type: 'TemporalLink',
      truthValue: this.calculateTemporalTruthValue(atom, sequence[i + 1])
    }));
  }

  private isProcedural(sequence: Atom[]): boolean {
    return sequence.some(atom => 
      atom.type === 'ActionNode' || 
      atom.type === 'ProcedureNode'
    );
  }

  private findTemporalPatterns(state: Atom): TemporalPattern[] {
    return Array.from(this.atomSpace.values())
      .filter(atom => 
        atom.type === 'TemporalLink' &&
        atom.outgoing?.[0] === state.id
      )
      .map(link => ({
        sequence: this.extractSequence(link),
        confidence: link.truthValue.confidence
      }));
  }

  private extractSequence(link: Atom): Atom[] {
    const sequence: Atom[] = [];
    let current = link;
    
    while (current && current.outgoing?.[1]) {
      const next = this.atomSpace.get(current.outgoing[1]);
      if (!next) break;
      sequence.push(next);
      current = Array.from(this.atomSpace.values())
        .find(atom => 
          atom.type === 'TemporalLink' &&
          atom.outgoing?.[0] === next.id
        ) || null;
    }

    return sequence;
  }

  private rankPredictions(patterns: TemporalPattern[]): Atom[] {
    return patterns
      .sort((a, b) => b.confidence - a.confidence)
      .map(pattern => pattern.sequence[0]);
  }

  private calculateTemporalTruthValue(source: Atom, target: Atom) {
    return {
      strength: Math.min(source.truthValue.strength, target.truthValue.strength),
      confidence: Math.min(source.truthValue.confidence, target.truthValue.confidence) * 0.9
    };
  }
}

interface TemporalLink {
  source: Atom;
  target: Atom;
  timestamp: number;
  type: string;
  truthValue: {
    strength: number;
    confidence: number;
  };
}

interface TemporalPattern {
  sequence: Atom[];
  confidence: number;
}