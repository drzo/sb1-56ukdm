import { Atom, TruthValue } from '../../types';

export class EpisodicMemory {
  private episodes: Map<string, Episode> = new Map();

  constructor(private atomSpace: Map<string, Atom>) {}

  storeEpisode(atoms: Atom[], context: EpisodeContext): void {
    const episode: Episode = {
      id: crypto.randomUUID(),
      atoms: atoms.map(a => a.id),
      context,
      timestamp: Date.now(),
      truthValue: this.calculateEpisodeTruthValue(atoms)
    };
    
    this.episodes.set(episode.id, episode);
    this.createEpisodicLinks(episode);
  }

  retrieveEpisodes(query: EpisodeQuery): Episode[] {
    return Array.from(this.episodes.values())
      .filter(episode => this.matchesQuery(episode, query))
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  addTemporalContext(temporalLinks: TemporalLink[]): void {
    temporalLinks.forEach(link => {
      const episodes = this.findRelatedEpisodes(link);
      episodes.forEach(episode => {
        episode.context.temporalLinks = [
          ...(episode.context.temporalLinks || []),
          link
        ];
      });
    });
  }

  private calculateEpisodeTruthValue(atoms: Atom[]): TruthValue {
    const tvs = atoms.map(a => a.truthValue).filter(Boolean);
    return {
      strength: tvs.reduce((sum, tv) => sum + tv.strength, 0) / tvs.length,
      confidence: Math.min(...tvs.map(tv => tv.confidence))
    };
  }

  private createEpisodicLinks(episode: Episode): void {
    episode.atoms.forEach((atomId, i) => {
      if (i === 0) return;
      const prevAtomId = episode.atoms[i - 1];
      
      this.atomSpace.set(`${prevAtomId}->${atomId}`, {
        id: `${prevAtomId}->${atomId}`,
        type: 'EpisodicLink',
        truthValue: episode.truthValue,
        outgoing: [prevAtomId, atomId]
      });
    });
  }

  private matchesQuery(episode: Episode, query: EpisodeQuery): boolean {
    if (query.timeRange) {
      if (episode.timestamp < query.timeRange.start || 
          episode.timestamp > query.timeRange.end) {
        return false;
      }
    }

    if (query.contextMatch) {
      return this.matchesContext(episode.context, query.contextMatch);
    }

    return true;
  }

  private matchesContext(context: EpisodeContext, match: Partial<EpisodeContext>): boolean {
    return Object.entries(match).every(([key, value]) => 
      context[key as keyof EpisodeContext] === value
    );
  }

  private findRelatedEpisodes(link: TemporalLink): Episode[] {
    return Array.from(this.episodes.values())
      .filter(episode => 
        episode.atoms.includes(link.source.id) || 
        episode.atoms.includes(link.target.id)
      );
  }
}

interface Episode {
  id: string;
  atoms: string[];
  context: EpisodeContext;
  timestamp: number;
  truthValue: TruthValue;
}

interface EpisodeContext {
  location?: string;
  actors?: string[];
  temporalLinks?: TemporalLink[];
  [key: string]: any;
}

interface EpisodeQuery {
  timeRange?: {
    start: number;
    end: number;
  };
  contextMatch?: Partial<EpisodeContext>;
}

interface TemporalLink {
  source: Atom;
  target: Atom;
  timestamp: number;
}