import { Connection, MemoryNode } from './memory';

export interface MemoryBranch {
  content: string;
  timestamp: number;
  instanceId: string;
  metrics: {
    energy: number;
    resonance: number;
    attention: number;
  };
}

export interface SheafNode {
  id: string;
  baseContent: string;
  branches: Map<number, MemoryBranch>;
  connections: Connection[];
}

export interface HeightIndexedNode extends MemoryNode {
  sheafId: string;
  branchHeight: number;
  parentHeight?: number;
}

export interface SheafConnection {
  sourceId: string;
  targetId: string;
  sourceHeight: number;
  targetHeight: number;
  type: 'resonant' | 'causal' | 'temporal' | 'associative';
  strength: number;
  context?: string;
}