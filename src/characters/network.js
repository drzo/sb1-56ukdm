export class CharacterNetwork {
  constructor() {
    this.characters = new Map();
    this.connections = new Map();
  }

  addCharacter(id, traits) {
    this.characters.set(id, {
      traits,
      connections: new Set()
    });
  }

  connect(char1Id, char2Id, strength = 0.5) {
    const char1 = this.characters.get(char1Id);
    const char2 = this.characters.get(char2Id);

    if (!char1 || !char2) return false;

    char1.connections.add(char2Id);
    char2.connections.add(char1Id);

    const connKey = [char1Id, char2Id].sort().join('-');
    this.connections.set(connKey, strength);

    return true;
  }

  getCharacterSummary(characterId) {
    const character = this.characters.get(characterId);
    if (!character) return null;

    return {
      traits: character.traits,
      connections: Array.from(character.connections)
    };
  }

  processInteraction(fromId, toId, context) {
    const from = this.characters.get(fromId);
    const to = this.characters.get(toId);

    if (!from || !to) return null;

    // Simple response generation based on traits
    const fromResponse = this.generateResponse(from.traits, context);
    const toResponse = this.generateResponse(to.traits, fromResponse);

    // Update traits based on interaction
    this.updateTraits(from, to, context);

    return {
      from: fromResponse,
      to: toResponse
    };
  }

  generateResponse(traits, input) {
    // Simple response generation based on character traits
    const sentiment = this.analyzeSentiment(input);
    const enthusiasm = traits.extraversion * 0.7 + traits.openness * 0.3;
    
    if (sentiment > 0.5) {
      return traits.agreeableness > 0.5 ? 
        "That's a wonderful perspective! I completely agree." :
        "Interesting point, though I see it differently.";
    } else {
      return enthusiasm > 0.5 ?
        "Let's explore this further and find common ground!" :
        "I understand your view, but let's consider alternatives.";
    }
  }

  analyzeSentiment(text) {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'wonderful', 'happy', 'agree'];
    const negativeWords = ['bad', 'wrong', 'disagree', 'unhappy', 'difficult'];

    const words = text.toLowerCase().split(' ');
    let score = 0.5;

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.1;
    });

    return Math.max(0, Math.min(1, score));
  }

  updateTraits(char1, char2, context) {
    const sentiment = this.analyzeSentiment(context);
    
    // Adjust traits based on interaction
    char1.traits.openness += (sentiment - 0.5) * 0.1;
    char2.traits.agreeableness += (sentiment - 0.5) * 0.1;

    // Ensure traits stay within bounds
    Object.keys(char1.traits).forEach(trait => {
      char1.traits[trait] = Math.max(0, Math.min(1, char1.traits[trait]));
    });
    
    Object.keys(char2.traits).forEach(trait => {
      char2.traits[trait] = Math.max(0, Math.min(1, char2.traits[trait]));
    });
  }
}