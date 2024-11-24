import { EventEmitter } from 'events';
import { Character, NetworkUpdate, Interaction } from '@/types';

class DashboardEvents extends EventEmitter {
  constructor() {
    super();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keep existing event listeners but with proper TypeScript types
    this.on('character:add', this.handleAddCharacter);
    this.on('character:update', this.handleUpdateCharacter);
    this.on('character:select', this.handleSelectCharacter);
    this.on('network:update', this.handleNetworkUpdate);
    this.on('network:connect', this.handleNetworkConnect);
    this.on('interaction:start', this.handleInteractionStart);
    this.on('interaction:complete', this.handleInteractionComplete);
  }

  handleAddCharacter = (character: Character) => {
    console.log('Adding character:', character);
  }

  handleUpdateCharacter = (id: number, updates: Partial<Character>) => {
    console.log('Updating character:', id, updates);
  }

  handleSelectCharacter = (id: number) => {
    console.log('Selected character:', id);
  }

  handleNetworkUpdate = (data: NetworkUpdate) => {
    console.log('Network update:', data);
  }

  handleNetworkConnect = (source: number, target: number) => {
    console.log('Network connection:', source, target);
  }

  handleInteractionStart = (data: Interaction) => {
    console.log('Interaction started:', data);
  }

  handleInteractionComplete = (data: Interaction) => {
    console.log('Interaction completed:', data);
  }
}

export const dashboardEvents = new DashboardEvents();