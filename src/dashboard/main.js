import { CharacterNetwork } from '../characters/network.js';
import { SimpleReservoir } from '../simple-reservoir.js';
import { UIComponents } from './ui-components.js';
import { EventHandler } from './events.js';

class Dashboard {
  constructor() {
    this.network = new CharacterNetwork();
    this.reservoir = new SimpleReservoir();
    this.events = new EventHandler(this);
    this.initializeCharacters();
  }

  initializeCharacters() {
    // Add initial community members
    this.network.addCharacter('local_shop_owner', {
      openness: 0.8,
      extraversion: 0.9,
      agreeableness: 0.8
    });

    this.network.addCharacter('community_teacher', {
      openness: 0.7,
      extraversion: 0.6,
      agreeableness: 0.9
    });

    // Connect characters
    this.network.connect('local_shop_owner', 'community_teacher', 0.8);

    // Update UI
    this.updateCharacterList();
    this.updateCharacterDetails('local_shop_owner');
  }

  handleNewCharacter(form) {
    const name = form.charName.value;
    const traits = {
      openness: parseInt(form.openness.value) / 100,
      extraversion: parseInt(form.extraversion.value) / 100,
      agreeableness: parseInt(form.agreeableness.value) / 100
    };

    this.network.addCharacter(name, traits);
    this.updateCharacterList();
    form.reset();
  }

  handleNewMessage() {
    const input = document.getElementById('userInput');
    const context = input.value.trim();
    
    if (!context) return;

    // Update reservoir state
    this.reservoir.update(context.length / 100);

    // Process interaction between characters
    const response = this.network.processInteraction(
      'local_shop_owner',
      'community_teacher',
      context
    );

    // Add messages to chat
    this.addMessageToChat('You', context);
    this.addMessageToChat('Shop Owner', response.from);
    this.addMessageToChat('Teacher', response.to);

    input.value = '';
    this.updateCharacterDetails('local_shop_owner');
  }

  addMessageToChat(sender, text) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = UIComponents.createMessageBubble(
      sender, 
      text, 
      sender === 'You'
    );
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  updateCharacterList() {
    const list = document.getElementById('characterList');
    list.innerHTML = '';

    for (const [id, char] of this.network.characters) {
      const div = UIComponents.createCharacterItem(id, () => {
        this.updateCharacterDetails(id);
      });
      list.appendChild(div);
    }
  }

  updateCharacterDetails(characterId) {
    const character = this.network.getCharacterSummary(characterId);
    if (!character) return;

    // Update trait bars
    const traitBars = document.getElementById('traitBars');
    traitBars.innerHTML = Object.entries(character.traits)
      .map(([trait, value]) => UIComponents.createTraitBar(trait, value))
      .join('');

    // Update connections
    const connections = document.getElementById('connections');
    connections.innerHTML = '';
    character.connections.forEach(id => {
      connections.appendChild(UIComponents.createConnectionBubble(id));
    });
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new Dashboard();
});