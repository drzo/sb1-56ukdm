export interface MemorySystem {
  id: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface MemoryFunction {
  id: string;
  name: string;
  description: string;
  code: string;
  systemId: string;
  assistantId: string;
  isEnabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssistantInstance {
  id: string;
  name: string;
  type: 'production' | 'development' | 'orchestrator';
  assistantId: string;
  systemPrompt: string;
  created_at: string;
  updated_at: string;
}

export interface AssistantMapping {
  functionId: string;
  assistantId: string;
  created_at: string;
  updated_at: string;
}