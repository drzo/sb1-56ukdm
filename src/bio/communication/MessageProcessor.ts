import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import { MessageQueue } from './MessageQueue';
import { SignalProcessor } from './processors/SignalProcessor';
import { ResponseProcessor } from './processors/ResponseProcessor';
import { CommunicationContext, SignalProcessingResult } from './types';

export class MessageProcessor {
  private signalProcessor: SignalProcessor;
  private responseProcessor: ResponseProcessor;
  private messageQueue: MessageQueue;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor() {
    this.signalProcessor = new SignalProcessor();
    this.responseProcessor = new ResponseProcessor();
    this.messageQueue = new MessageQueue();
    Logger.info('MessageProcessor initialized');
  }

  async processMessage(
    message: string,
    context: CommunicationContext
  ): Promise<string> {
    const timer = new Timer();
    try {
      // Queue message
      await this.messageQueue.enqueue({
        message,
        context,
        timestamp: Date.now()
      });

      // Process signal
      const processedSignal = await this.processWithRetry(
        () => this.signalProcessor.process(this.encodeMessage(message))
      );

      // Generate response
      const response = await this.processWithRetry(
        () => this.responseProcessor.process(processedSignal.processed)
      );

      Logger.debug(`Message processed in ${timer.stop()}ms`);
      return this.decodeResponse(response.processed, context.messageType);
    } catch (error) {
      Logger.error('Failed to process message:', error);
      throw error;
    }
  }

  private async processWithRetry<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        Logger.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          await Timer.sleep(this.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  private encodeMessage(message: string): Float32Array {
    const encoded = new Float32Array(64);
    for (let i = 0; i < Math.min(message.length, 64); i++) {
      encoded[i] = message.charCodeAt(i) / 255;
    }
    return encoded;
  }

  private decodeResponse(data: Float32Array, messageType: string): string {
    const chars = Array.from(data)
      .map(v => String.fromCharCode(Math.floor(v * 255)))
      .join('');
    return `${messageType.toUpperCase()}: ${chars}`;
  }

  dispose(): void {
    this.signalProcessor.dispose();
    this.responseProcessor.dispose();
    this.messageQueue.clear();
  }
}