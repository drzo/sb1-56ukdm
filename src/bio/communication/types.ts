export interface CommunicationContext {
  sender: string;
  receiver: string;
  timestamp: number;
  signalStrength: number;
  messageType: 'query' | 'response' | 'alert' | 'status';
}

export interface SignalProcessingResult {
  processed: Float32Array;
  metadata: {
    complexity: number;
    confidence: number;
    timestamp: number;
  };
}

export interface MemoryEntry {
  signal: string;
  response: string;
  context: CommunicationContext;
  state: Float32Array;
  timestamp: number;
}

export interface NetworkState {
  connections: number;
  bandwidth: number;
  latency: number;
  reliability: number;
}