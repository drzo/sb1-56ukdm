export class UIComponents {
  static createMessageBubble(sender, text, isSent = false) {
    const div = document.createElement('div');
    div.className = `message ${isSent ? 'sent' : 'received'}`;
    
    div.innerHTML = `
      <div class="message-bubble">
        <div class="message-sender">${sender}</div>
        <div class="message-text">${text}</div>
      </div>
    `;
    
    return div;
  }

  static createCharacterItem(id, onClick) {
    const div = document.createElement('div');
    div.className = 'character-item';
    div.textContent = id;
    div.addEventListener('click', onClick);
    return div;
  }

  static createTraitBar(trait, value) {
    return `
      <div class="trait-bar">
        <label>${trait}</label>
        <div class="bar">
          <div class="bar-fill" style="width: ${value * 100}%"></div>
        </div>
      </div>
    `;
  }

  static createConnectionBubble(id) {
    const div = document.createElement('div');
    div.className = 'connection-bubble';
    div.textContent = id;
    return div;
  }

  static createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;
    
    return modal;
  }

  static createNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    return notification;
  }
}