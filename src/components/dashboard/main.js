import { dashboardEvents } from './events.js';
import { UIComponents } from './ui-components.js';
import { CharacterNetwork } from '../characters/network.js';
import { SimpleReservoir } from '../simple-reservoir.js';

class Dashboard {
  constructor() {
    this.network = new CharacterNetwork();
    this.reservoir = new SimpleReservoir();
    this.setupEventListeners();
    this.initializeComponents();
  }

  setupEventListeners() {
    // Add character button
    document.getElementById('addCharacterBtn')?.addEventListener('click', 
      () => this.showAddCharacterModal()
    );

    // Setup dashboard events
    dashboardEvents.on('character:add', this.handleAddCharacter.bind(this));
    dashboardEvents.on('network:update', this.handleNetworkUpdate.bind(this));
    dashboardEvents.on('interaction:complete', this.handleInteractionComplete.bind(this));
  }

  initializeComponents() {
    // Initialize with some example data
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
    this.updateNetworkStatus();
  }

  showAddCharacterModal() {
    const modal = document.getElementById('modal');
    const content = `
      <form id="characterForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input type="text" name="name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Traits</label>
          <div class="space-y-4">
            <input type="range" name="openness" min="0" max="100" value="50">
            <input type="range" name="extraversion" min="0" max="100" value="50">
            <input type="range" name="agreeableness" min="0" max="100" value="50">
          </div>
        </div>
        <div class="flex justify-end gap-4">
          <button type="button" class="px-4 py-2 text-gray-700" onclick="closeModal()">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md">Create</button>
        </div>
      </form>
    `;

    modal.innerHTML = content;
    modal.classList.add('active');

    document.getElementById('characterForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddCharacter(new FormData(e.target));
      modal.classList.remove('active');
    });
  }

  handleAddCharacter(formData) {
    const character = {
      name: formData.get('name'),
      traits: {
        openness: parseInt(formData.get('openness')) / 100,
        extraversion: parseInt(formData.get('extraversion')) / 100,
        agreeableness: parseInt(formData.get('agreeableness')) / 100
      }
    };

    this.network.addCharacter(character.name, character.traits);
    this.updateCharacterList();
    this.updateNetworkStatus();
  }

  handleNetworkUpdate(data) {
    this.updateNetworkStatus();
    this.addActivityItem(`Network updated: ${data.description}`);
  }

  handleInteractionComplete(data) {
    this.addActivityItem(`Interaction completed between ${data.characters.join(' and ')}`);
  }

  updateCharacterList() {
    const list = document.getElementById('characterList');
    if (!list) return;

    list.innerHTML = '';
    for (const [id, char] of this.network.characters) {
      const item = UIComponents.createCharacterItem(id, () => {
        this.showCharacterDetails(id);
      });
      list.appendChild(item);
    }
  }

  updateNetworkStatus() {
    const status = document.getElementById('networkStatus');
    if (!status) return;

    const connections = Array.from(this.network.connections.entries());
    status.innerHTML = `
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <p>Characters: ${this.network.characters.size}</p>
        <p>Connections: ${connections.length}</p>
      </div>
    `;
  }

  addActivityItem(text) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    const item = document.createElement('div');
    item.className = 'text-sm text-gray-600 dark:text-gray-400 slide-in';
    item.textContent = text;
    
    feed.insertBefore(item, feed.firstChild);
    if (feed.children.length > 5) {
      feed.removeChild(feed.lastChild);
    }
  }

  showCharacterDetails(id) {
    const character = this.network.characters.get(id);
    if (!character) return;

    const modal = document.getElementById('modal');
    modal.innerHTML = UIComponents.createModal(
      character.name,
      UIComponents.createCharacterDetails(character)
    ).innerHTML;
    modal.classList.add('active');
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new Dashboard();
});