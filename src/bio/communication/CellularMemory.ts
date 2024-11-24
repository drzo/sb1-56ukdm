import { Logger } from '../../cogutil/Logger';

interface MemoryEntry {
  signal: string;
  response: string;
  context: any;
  state: Float32Array;
  timestamp: number;
}

export class CellularMemory {
  private memory: MemoryEntry[];
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.memory = [];
    this.maxSize = maxSize;
    Logger.info('CellularMemory initialized');
  }

  store(entry: Omit<MemoryEntry, 'timestamp'>): void {
    try {
      // Add timestamp
      const memoryEntry: MemoryEntry = {
        ...entry,
        timestamp: Date.now()
      };

      // Add to memory
      this.memory.push(memoryEntry);

      // Maintain size limit
      if (this.memory.length > this.maxSize) {
        this.memory.shift();
      }
    } catch (error) {
      Logger.error('Failed to store memory:', error);
      throw error;
    }
  }

  getRecentCommunications(
    sender: string,
    receiver: string,
    limit: number
  ): Float32Array[] {
    try {
      return this.memory
        .filter(entry => 
          entry.context.sender === sender && 
          entry.context.receiver === receiver
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
        .map(entry => entry.state);
    } catch (error) {
      Logger.error('Failed to retrieve communications:', error);
      throw error;
    }
  }

  search(query: string): MemoryEntry[] {
    try {
      const searchTerms = query.toLowerCase().split(' ');
      return this.memory.filter(entry =>
        searchTerms.some(term =>
          entry.signal.toLowerCase().includes(term) ||
          entry.response.toLowerCase().includes(term)
        )
      );
    } catch (error) {
      Logger.error('Failed to search memory:', error);
      throw error;
    }
  }

  clear(): void {
    this.memory = [];
  }

  save(): void {
    try {
      localStorage.setItem('cellular-memory', JSON.stringify(this.memory));
    } catch (error) {
      Logger.error('Failed to save memory:', error);
      throw error;
    }
  }

  load(): void {
    try {
      const stored = localStorage.getItem('cellular-memory');
      if (stored) {
        this.memory = JSON.parse(stored);
      }
    } catch (error) {
      Logger.error('Failed to load memory:', error);
      throw error;
    }
  }
}