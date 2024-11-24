import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import { CommunicationContext, MemoryEntry } from './types';
import { SignalProcessor } from './processors/SignalProcessor';
import { ResponseProcessor } from './processors/ResponseProcessor';
import { CommunicationChannel } from './network/CommunicationChannel';
import { CellularMemory } from './CellularMemory';

export class CellularCommunicationSystem {
  private signalProcessor: SignalProcessor;
  private responseProcessor: ResponseProcessor;
  private channel: CommunicationChannel;
  private memory: CellularMemory;
  private readonly contextWindow: number = 5;

  constructor() {
    this.signalProcessor = new SignalProcessor();
    this.responseProcessor = new ResponseProcessor();
    this.channel = new CommunicationChannel('main');
    this.memory = new CellularMemory(1000);
    Logger.info('CellularCommunicationSystem initialized');
  }

  async processSignal(
    signal: string,
    context: CommunicationContext
  ): Promise<string> {
    const timer = new Timer();
    try {
      // Connect if needed
      if (!this.channel.isConnected()) {
        await this.channel.connect();
      }

      // Process signal
      const encodedSignal = await this.encodeSignal(signal);
      const history = this.memory.getRecentCommunications(
        context.sender,
        context.receiver,
        this.contextWindow
      );

      // Send over channel
      await this.channel.send(encodedSignal);

      // Generate and process response
      const response = await this.generateResponse(encodedSignal, context);
      
      // Store in memory
      this.memory.store({
        signal,
        response,
        context,
        state: encodedSignal
      });

      Logger.debug(`Signal processed in ${timer.stop()}ms`);
      return response;
    } catch (error) {
      Logger.error('Failed to process signal:', error);
      throw error;
    }
  }

  private async encodeSignal(signal: string): Promise<Float32Array> {
    try {
      const encoded = new Float32Array(64); // Simplified encoding
      for (let i = 0; i < Math.min(signal.length, 64); i++) {
        encoded[i] = signal.charCodeAt(i) / 255;
      }
      return (await this.signalProcessor.process(encoded)).processed;
    } catch (error) {
      Logger.error('Signal encoding failed:', error);
      throw error;
    }
  }

  private async generateResponse(
    state: Float32Array,
    context: CommunicationContext
  ): Promise<string> {
    try {
      const processed = await this.responseProcessor.process(state);
      return this.decodeResponse(processed.processed, context.messageType);
    } catch (error) {
      Logger.error('Response generation failed:', error);
      throw error;
    }
  }

  private decodeResponse(data: Float32Array, messageType: string): string {
    // Simple decoding for demonstration
    const chars = Array.from(data)
      .map(v => String.fromCharCode(Math.floor(v * 255)))
      .join('');
    return `${messageType.toUpperCase()}: ${chars}`;
  }

  async train(trainingData: Array<{
    input: string;
    output: string;
    context: CommunicationContext;
  }>): Promise<void> {
    const timer = new Timer();
    try {
      // Prepare training data
      const inputs = await Promise.all(
        trainingData.map(d => this.encodeSignal(d.input))
      );
      
      const targets = await Promise.all(
        trainingData.map(d => this.encodeSignal(d.output))
      );

      // Train processors
      await Promise.all([
        this.signalProcessor.train(inputs, targets),
        this.responseProcessor.train(inputs, targets)
      ]);

      Logger.info(`Training completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Training failed:', error);
      throw error;
    }
  }

  dispose(): void {
    this.signalProcessor.dispose();
    this.responseProcessor.dispose();
    this.channel.disconnect();
    this.memory.clear();
  }
}