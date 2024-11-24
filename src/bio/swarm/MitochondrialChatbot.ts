import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';
import { MitochondrialProfile } from '../training/MitochondrialProfile';
import { MitochondrialStatus } from './types';

interface ChatMessage {
  role: 'mitochondria' | 'cell' | 'system';
  content: string;
  timestamp: number;
}

export class MitochondrialChatbot {
  private profile: MitochondrialProfile;
  private conversationHistory: ChatMessage[];
  private readonly maxHistoryLength = 10;
  private model: tf.LayersModel | null = null;

  constructor(profile: MitochondrialProfile) {
    this.profile = profile;
    this.conversationHistory = [];
    this.initializeModel();
    Logger.info('MitochondrialChatbot initialized');
  }

  private async initializeModel(): Promise<void> {
    try {
      // Simple sentiment analysis model
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [10] }));
      model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
      
      model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      this.model = model;
    } catch (error) {
      Logger.error('Failed to initialize model:', error);
    }
  }

  async processMessage(
    message: string, 
    status: MitochondrialStatus
  ): Promise<string> {
    const timer = new Timer();
    try {
      // Add message to history
      this.addToHistory({
        role: 'cell',
        content: message,
        timestamp: Date.now()
      });

      // Analyze message sentiment
      const sentiment = await this.analyzeSentiment(message);

      // Generate response based on profile personality, status, and sentiment
      const response = await this.generateResponse(message, status, sentiment);

      // Add response to history
      this.addToHistory({
        role: 'mitochondria',
        content: response,
        timestamp: Date.now()
      });

      Logger.debug(`Generated response in ${timer.stop()}ms`);
      return response;
    } catch (error) {
      Logger.error('Failed to process message:', error);
      throw error;
    }
  }

  private async analyzeSentiment(message: string): Promise<number> {
    if (!this.model) return 0.5;

    try {
      // Simple feature extraction (placeholder)
      const features = new Array(10).fill(0);
      const words = message.toLowerCase().split(' ');
      
      // Count positive and negative words
      const positiveWords = ['good', 'great', 'excellent', 'efficient'];
      const negativeWords = ['bad', 'poor', 'inefficient', 'stress'];

      words.forEach(word => {
        if (positiveWords.includes(word)) features[0]++;
        if (negativeWords.includes(word)) features[1]++;
      });

      // Convert to tensor and predict
      const input = tf.tensor2d([features], [1, 10]);
      const prediction = this.model.predict(input) as tf.Tensor;
      const sentiment = await prediction.data();
      
      input.dispose();
      prediction.dispose();

      return sentiment[0];
    } catch (error) {
      Logger.error('Sentiment analysis failed:', error);
      return 0.5;
    }
  }

  private async generateResponse(
    message: string,
    status: MitochondrialStatus,
    sentiment: number
  ): Promise<string> {
    const profile = this.profile.getProfile();
    const context = this.getConversationContext();

    // Generate response based on personality traits and sentiment
    const responses = new Map<string, string[]>([
      ['energy_status', [
        `Operating at ${Math.round(status.efficiency * 100)}% efficiency. ${
          status.efficiency > 0.8 
            ? "I'm feeling quite energetic!" 
            : "Could use a glucose boost..."
        }`,
        `Current energy output is ${Math.round(status.energyOutput * 100)}%. ${
          status.energyOutput > 0.7
            ? "We're powering through!"
            : "Working on optimizing..."
        }`
      ]],
      ['network_status', [
        `Network stability at ${Math.round((1 - status.damage) * 100)}%. ${
          status.damage < 0.3
            ? "Everything's running smoothly."
            : "Some maintenance required."
        }`,
        `Coordinating with ${status.count} fellow mitochondria. ${
          status.fusion > status.fission
            ? "We're working together beautifully!"
            : "Each handling our own tasks."
        }`
      ]],
      ['general', [
        `Just doing my part to keep things running! ${
          profile.traits.find(t => t.name === 'Efficiency')?.value || 0 > 0.7
            ? "And quite efficiently, I might add!"
            : "Always looking to improve!"
        }`,
        `Ready to adapt as needed. ${
          profile.traits.find(t => t.name === 'Adaptability')?.value || 0 > 0.7
            ? "Change is our specialty!"
            : "One step at a time."
        }`
      ]]
    ]);

    // Select response category based on message content and sentiment
    let category = 'general';
    if (message.toLowerCase().includes('energy') || 
        message.toLowerCase().includes('power')) {
      category = 'energy_status';
    } else if (message.toLowerCase().includes('network') || 
               message.toLowerCase().includes('others')) {
      category = 'network_status';
    }

    // Get responses for category
    const possibleResponses = responses.get(category) || responses.get('general')!;
    
    // Select response based on context, personality, and sentiment
    const responseIndex = Math.floor(
      ((profile.traits.find(t => t.name === 'Adaptability')?.value || 0.5) + sentiment) / 2 * 
      possibleResponses.length
    );

    return `${profile.name}: ${possibleResponses[responseIndex]}`;
  }

  private addToHistory(message: ChatMessage): void {
    this.conversationHistory.push(message);
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory.shift();
    }
  }

  private getConversationContext(): string {
    return this.conversationHistory
      .slice(-3)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  getProfile(): MitochondrialProfile {
    return this.profile;
  }

  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  async dispose(): Promise<void> {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}