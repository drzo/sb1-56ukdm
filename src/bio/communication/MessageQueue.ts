import { Logger } from '../../cogutil/Logger';

interface QueuedMessage {
  id: string;
  content: any;
  timestamp: number;
  retries: number;
}

export class MessageQueue {
  private queue: QueuedMessage[] = [];
  private readonly maxRetries: number = 3;
  private readonly maxQueueSize: number = 1000;
  private readonly retryDelay: number = 1000;

  async enqueue(message: any): Promise<void> {
    try {
      if (this.queue.length >= this.maxQueueSize) {
        throw new Error('Message queue is full');
      }

      this.queue.push({
        id: crypto.randomUUID(),
        content: message,
        timestamp: Date.now(),
        retries: 0
      });

      Logger.debug(`Message enqueued, queue size: ${this.queue.length}`);
    } catch (error) {
      Logger.error('Failed to enqueue message:', error);
      throw error;
    }
  }

  async dequeue(): Promise<any | null> {
    try {
      const message = this.queue.shift();
      if (!message) return null;

      Logger.debug(`Message dequeued, queue size: ${this.queue.length}`);
      return message.content;
    } catch (error) {
      Logger.error('Failed to dequeue message:', error);
      throw error;
    }
  }

  async retry(message: QueuedMessage): Promise<void> {
    try {
      if (message.retries >= this.maxRetries) {
        Logger.warn(`Message ${message.id} exceeded max retries`);
        return;
      }

      message.retries++;
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      this.queue.push(message);

      Logger.debug(`Message ${message.id} requeued for retry ${message.retries}`);
    } catch (error) {
      Logger.error('Failed to retry message:', error);
      throw error;
    }
  }

  clear(): void {
    this.queue = [];
    Logger.info('Message queue cleared');
  }

  size(): number {
    return this.queue.length;
  }
}