export type InstanceType = 'bolt' | 'chatgpt' | 'assistant' | 'character-ai';

export interface APIConfig {
  type: 'openai' | 'characterai' | 'bolt';
  apiKey?: string;
  organizationId?: string;
  modelName?: string;
  baseUrl?: string;
}

export interface InstanceConfig {
  id: string;
  type: InstanceType;
  platform: string;
  height: number;
  api: APIConfig;
  context?: {
    conversationId?: string;
    threadId?: string;
    sessionId?: string;
  };
}

export interface NetworkMessage {
  id: string;
  instanceId: string;
  content: string;
  timestamp: number;
  type: 'thought' | 'query' | 'response' | 'reflection';
  context?: {
    memoryIds?: string[];
    height?: number;
    resonance?: number;
  };
}

export interface InstanceState {
  id: string;
  status: 'active' | 'idle' | 'thinking' | 'learning';
  lastActive: number;
  currentTask?: string;
  metrics: {
    resonance: number;
    attention: number;
    energy: number;
  };
}