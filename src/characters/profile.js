// Character profile representing a community member
export class CommunityCharacter {
  constructor(id, traits = {}) {
    this.id = id;
    this.traits = {
      openness: traits.openness || Math.random(),
      conscientiousness: traits.conscientiousness || Math.random(),
      extraversion: traits.extraversion || Math.random(),
      agreeableness: traits.agreeableness || Math.random(),
      stability: traits.stability || Math.random()
    };
    this.interactions = [];
    this.connections = new Map();
  }

  // Update traits based on interactions
  updateTraits(interaction) {
    const impact = 0.1;
    this.traits.openness += impact * (interaction.sentiment * interaction.intensity);
    this.traits.extraversion += impact * (interaction.social_engagement);
    // Normalize traits to stay in [0,1]
    Object.keys(this.traits).forEach(trait => {
      this.traits[trait] = Math.max(0, Math.min(1, this.traits[trait]));
    });
  }

  // Generate a character-like response based on traits
  generateResponse(context) {
    const style = this.traits.openness > 0.7 ? 'enthusiastic' : 
                 this.traits.stability > 0.7 ? 'calm' : 'neutral';
    
    const templates = {
      enthusiastic: `I'm really excited about ${context}!`,
      calm: `That's an interesting point about ${context}.`,
      neutral: `Let's discuss ${context} further.`
    };

    return templates[style];
  }
}</content></file>

<boltAction type="file" filePath="src/characters/network.js">import { CommunityCharacter } from './profile.js';
import { SimpleReservoir } from '../simple-reservoir.js';

export class CharacterNetwork {
  constructor() {
    this.characters = new Map();
    this.reservoir = new SimpleReservoir(32); // For modeling interaction dynamics
  }

  // Add a community member as a character
  addCharacter(id, traits = {}) {
    const character = new CommunityCharacter(id, traits);
    this.characters.set(id, character);
    return character;
  }

  // Create a connection between characters
  connect(id1, id2, strength = 0.5) {
    const char1 = this.characters.get(id1);
    const char2 = this.characters.get(id2);
    
    if (char1 && char2) {
      char1.connections.set(id2, { character: char2, strength });
      char2.connections.set(id1, { character: char1, strength });
    }
  }

  // Process an interaction between characters
  processInteraction(fromId, toId, context) {
    const from = this.characters.get(fromId);
    const to = this.characters.get(toId);
    
    if (!from || !to) return null;

    // Use reservoir to model interaction dynamics
    const state = this.reservoir.process(
      from.traits.extraversion * to.traits.openness
    );

    // Create interaction object
    const interaction = {
      sentiment: state[0], // Use first reservoir node for sentiment
      intensity: state[1], // Second node for intensity
      social_engagement: state[2], // Third node for social aspect
      timestamp: Date.now()
    };

    // Update character traits based on interaction
    from.updateTraits(interaction);
    to.updateTraits(interaction);

    // Generate responses
    return {
      from: from.generateResponse(context),
      to: to.generateResponse(context)
    };
  }

  // Get character profile summary
  getCharacterSummary(id) {
    const char = this.characters.get(id);
    if (!char) return null;

    return {
      id: char.id,
      traits: char.traits,
      connections: Array.from(char.connections.keys()),
      interactionStyle: char.traits.extraversion > 0.5 ? 'outgoing' : 'reserved'
    };
  }
}</content></file>

<boltAction type="file" filePath="src/characters/interface.js">export class CharacterInterface {
  constructor(network) {
    this.network = network;
  }

  // Generate character listing HTML
  generateCharacterList() {
    let html = '<div class="character-grid">';
    
    for (const [id, char] of this.network.characters) {
      const summary = this.network.getCharacterSummary(id);
      html += `
        <div class="character-card">
          <h3>${id}</h3>
          <div class="trait-bars">
            ${Object.entries(summary.traits)
              .map(([trait, value]) => `
                <div class="trait-bar">
                  <label>${trait}</label>
                  <div class="bar" style="width: ${value * 100}%"></div>
                </div>
              `).join('')}
          </div>
          <p>Interaction style: ${summary.interactionStyle}</p>
          <p>Connections: ${summary.connections.join(', ')}</p>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  // Generate chat interface HTML
  generateChatInterface(char1Id, char2Id) {
    const char1 = this.network.characters.get(char1Id);
    const char2 = this.network.characters.get(char2Id);
    
    if (!char1 || !char2) return '';

    return `
      <div class="chat-interface">
        <div class="chat-header">
          <h3>${char1Id} & ${char2Id}</h3>
        </div>
        <div class="chat-messages" id="messages">
          <!-- Messages will be added here -->
        </div>
        <div class="chat-input">
          <input type="text" id="context" placeholder="Enter conversation context...">
          <button onclick="triggerInteraction('${char1Id}', '${char2Id}')">
            Interact
          </button>
        </div>
      </div>
    `;
  }

  // Add basic styling
  getStyles() {
    return `
      <style>
        .character-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
        }
        
        .character-card {
          background: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .trait-bar {
          margin: 5px 0;
        }

        .trait-bar .bar {
          height: 8px;
          background: #4CAF50;
          border-radius: 4px;
        }

        .chat-interface {
          max-width: 600px;
          margin: 20px auto;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .chat-messages {
          height: 300px;
          overflow-y: auto;
          padding: 15px;
        }

        .chat-input {
          padding: 15px;
          border-top: 1px solid #ddd;
          display: flex;
          gap: 10px;
        }

        .chat-input input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .chat-input button {
          padding: 8px 16px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
    `;
  }
}</content></file>

<boltAction type="file" filePath="src/characters/index.js">import { CharacterNetwork } from './network.js';
import { CharacterInterface } from './interface.js';

// Create network and interface
const network = new CharacterNetwork();
const interface = new CharacterInterface(network);

// Add some example community members as characters
console.log('Creating community character network...');

network.addCharacter('local_shop_owner', {
  openness: 0.8,
  conscientiousness: 0.7,
  extraversion: 0.9,
  agreeableness: 0.8,
  stability: 0.6
});

network.addCharacter('community_teacher', {
  openness: 0.7,
  conscientiousness: 0.9,
  extraversion: 0.6,
  agreeableness: 0.9,
  stability: 0.8
});

network.addCharacter('youth_mentor', {
  openness: 0.9,
  conscientiousness: 0.8,
  extraversion: 0.7,
  agreeableness: 0.9,
  stability: 0.7
});

// Connect characters based on community relationships
console.log('\nEstablishing character connections...');
network.connect('local_shop_owner', 'community_teacher', 0.8);
network.connect('community_teacher', 'youth_mentor', 0.9);
network.connect('youth_mentor', 'local_shop_owner', 0.7);

// Simulate some interactions
console.log('\nSimulating character interactions...');
const contexts = [
  'community garden project',
  'youth education program',
  'local business collaboration'
];

contexts.forEach((context, i) => {
  console.log(`\nInteraction ${i + 1} - Context: ${context}`);
  
  const response = network.processInteraction(
    'local_shop_owner',
    'community_teacher',
    context
  );
  
  console.log('Shop owner:', response.from);
  console.log('Teacher:', response.to);
});</content></file>

<boltAction type="file" filePath="package.json">{
  "name": "community-characters",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/characters/index.js"
  }
}</content></file>

<boltAction type="start">
<command>npm start</command>