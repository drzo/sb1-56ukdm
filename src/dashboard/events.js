export class EventHandler {
  constructor(dashboard) {
    this.dashboard = dashboard;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Add character button
    document.getElementById('addCharacterBtn')
      .addEventListener('click', () => this.showAddCharacterModal());

    // Character form submission
    document.getElementById('characterForm')
      .addEventListener('submit', (e) => this.handleNewCharacter(e));

    // Send message button
    document.getElementById('sendBtn')
      .addEventListener('click', () => this.dashboard.handleNewMessage());

    // Enter key in textarea
    document.getElementById('userInput')
      .addEventListener('keypress', (e) => this.handleKeyPress(e));
  }

  showAddCharacterModal() {
    const modal = document.getElementById('addCharacterModal');
    modal.classList.add('active');
  }

  handleNewCharacter(e) {
    e.preventDefault();
    this.dashboard.handleNewCharacter(e.target);
    document.getElementById('addCharacterModal').classList.remove('active');
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.dashboard.handleNewMessage();
    }
  }
}