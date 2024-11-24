// Episodic memory system using narrative structures
export class EpisodicMemory {
  constructor() {
    this.episodes = [];
    this.currentContext = null;
  }

  // Record a new episode
  recordEpisode(event) {
    const episode = {
      id: this.episodes.length,
      timestamp: Date.now(),
      event,
      context: this.currentContext,
      connections: new Set()
    };

    // Connect to similar episodes
    this.findSimilarEpisodes(episode).forEach(similar => {
      episode.connections.add(similar.id);
      similar.connections.add(episode.id);
    });

    this.episodes.push(episode);
    return episode;
  }

  // Set current context for new episodes
  setContext(context) {
    this.currentContext = context;
  }

  // Find similar episodes using narrative patterns
  findSimilarEpisodes(episode, threshold = 0.5) {
    return this.episodes.filter(other => {
      if (other.id === episode.id) return false;
      return this.calculateSimilarity(episode, other) > threshold;
    });
  }

  // Calculate narrative similarity between episodes
  calculateSimilarity(ep1, ep2) {
    let score = 0;
    
    // Context similarity
    if (ep1.context && ep2.context) {
      score += this.contextSimilarity(ep1.context, ep2.context);
    }
    
    // Event similarity
    score += this.eventSimilarity(ep1.event, ep2.event);
    
    // Temporal proximity
    const timeDistance = Math.abs(ep1.timestamp - ep2.timestamp);
    score += Math.exp(-timeDistance / (24 * 60 * 60 * 1000)); // Decay over days

    return score / 3; // Normalize
  }

  contextSimilarity(ctx1, ctx2) {
    // Simple context matching
    return ctx1 === ctx2 ? 1 : 0;
  }

  eventSimilarity(evt1, evt2) {
    // Compare event properties
    const props1 = Object.entries(evt1);
    const props2 = Object.entries(evt2);
    
    let matches = 0;
    for (const [key, val1] of props1) {
      const val2 = evt2[key];
      if (val1 === val2) matches++;
    }
    
    return matches / Math.max(props1.length, props2.length);
  }
}