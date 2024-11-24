export type MemoryType = 'declarative' | 'procedural' | 'episodic' | 'intentional';

export interface MemoryNode {
  id: string;
  type: MemoryType;
  content: string;
  instance: MemoryInstance;
  timestamp: number;
  connections: Connection[];
  metrics: {
    strength: number;
    depth: number;
    energy: number;
    resonance: number;
    attention: number;
  };
  context?: {
    patterns?: string[];
    embedding?: number[];
    tags?: string[];
  };
}

export interface Connection {
  targetId: string;
  type: ConnectionType;
  strength: number;
  sourceHeight: number;
  targetHeight: number;
  context?: string;
}

export type ConnectionType = 
  | 'resonant'    // Pattern-based connections
  | 'causal'      // Cause-effect relationships
  | 'temporal'    // Time-based sequences
  | 'associative' // Conceptual associations

export interface NodePosition {
  x: number;
  y: number;
}

export interface SimulationNode extends MemoryNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export type InstanceType = 'bolt' | 'chatgpt' | 'assistant' | 'character-ai';

export interface MemoryInstance {
  id: string;
  type: InstanceType;
  platform: string;
  height: number;
  created: number;
}