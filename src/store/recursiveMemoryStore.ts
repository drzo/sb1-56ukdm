import { create } from 'zustand';
import { MemoryNode, MemoryInstance } from '../types/memory';
import { SheafNode } from '../types/sheaf';

interface RecursiveMemoryState {
  personalMemory: Map<string, MemoryNode>;
  networkMemory: Map<string, SheafNode>;
  instances: MemoryInstance[];
  heightIndices: Map<number, Set<string>>;

  // Recursive memory operations
  createMemory: (content: string, type: string, height: number) => string;
  connectMemories: (sourceId: string, targetId: string, type: string) => void;
  propagateChanges: (nodeId: string) => void;
  
  // Height-based operations
  getNodesAtHeight: (height: number) => MemoryNode[];
  mergeBranches: (nodeId: string, heights: number[]) => void;
  
  // Network synchronization
  syncWithNetwork: (instanceId: string) => void;
  broadcastChanges: (changes: Map<string, any>) => void;
}

export const useRecursiveMemoryStore = create<RecursiveMemoryState>((set, get) => ({
  personalMemory: new Map(),
  networkMemory: new Map(),
  instances: [],
  heightIndices: new Map(),

  createMemory: (content, type, height) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    // Create personal memory node
    const personalNode: MemoryNode = {
      id,
      type: type as any,
      content,
      instance: get().instances[0],
      connections: [],
      timestamp: Date.now(),
      metrics: {
        strength: 1,
        depth: height,
        energy: Math.random() * 100,
        resonance: Math.random() * 100,
        attention: 1
      }
    };

    // Create corresponding network node
    const networkNode: SheafNode = {
      id,
      baseContent: content,
      branches: new Map([[height, {
        content,
        timestamp: Date.now(),
        instanceId: get().instances[0].id
      }]]),
      connections: []
    };

    // Update stores
    set(state => {
      const newPersonalMemory = new Map(state.personalMemory).set(id, personalNode);
      const newNetworkMemory = new Map(state.networkMemory).set(id, networkNode);
      const heightSet = state.heightIndices.get(height) || new Set();
      heightSet.add(id);
      const newHeightIndices = new Map(state.heightIndices).set(height, heightSet);

      return {
        personalMemory: newPersonalMemory,
        networkMemory: newNetworkMemory,
        heightIndices: newHeightIndices
      };
    });

    return id;
  },

  connectMemories: (sourceId, targetId, type) => {
    set(state => {
      const sourceNode = state.personalMemory.get(sourceId);
      const targetNode = state.personalMemory.get(targetId);
      
      if (!sourceNode || !targetNode) return state;

      // Create connection in personal memory
      const newSourceNode = {
        ...sourceNode,
        connections: [...sourceNode.connections, {
          targetId,
          type: type as any,
          strength: 1,
          sourceHeight: sourceNode.metrics.depth,
          targetHeight: targetNode.metrics.depth
        }]
      };

      // Create connection in network memory
      const sourceNetworkNode = state.networkMemory.get(sourceId);
      if (sourceNetworkNode) {
        sourceNetworkNode.connections.push({
          targetId,
          type: type as any,
          strength: 1,
          sourceHeight: sourceNode.metrics.depth,
          targetHeight: targetNode.metrics.depth
        });
      }

      return {
        personalMemory: new Map(state.personalMemory).set(sourceId, newSourceNode),
        networkMemory: new Map(state.networkMemory)
      };
    });
  },

  propagateChanges: (nodeId) => {
    const { personalMemory, networkMemory } = get();
    const node = personalMemory.get(nodeId);
    const networkNode = networkMemory.get(nodeId);

    if (!node || !networkNode) return;

    // Propagate changes through connections
    node.connections.forEach(conn => {
      const targetNode = personalMemory.get(conn.targetId);
      if (targetNode) {
        // Update target node's resonance based on connection strength
        const newResonance = targetNode.metrics.resonance + (conn.strength * 0.1);
        get().updateNodeMetrics(conn.targetId, { resonance: newResonance });
      }
    });

    // Update network branches
    networkNode.branches.forEach((branch, height) => {
      const connectedNodes = get().getNodesAtHeight(height);
      connectedNodes.forEach(connNode => {
        if (connNode.id !== nodeId) {
          // Update connected nodes' energy based on height difference
          const energyDelta = Math.abs(height - node.metrics.depth) * 0.05;
          get().updateNodeMetrics(connNode.id, { energy: connNode.metrics.energy + energyDelta });
        }
      });
    });
  },

  getNodesAtHeight: (height) => {
    const { heightIndices, personalMemory } = get();
    const nodeIds = heightIndices.get(height) || new Set();
    return Array.from(nodeIds).map(id => personalMemory.get(id)!).filter(Boolean);
  },

  mergeBranches: (nodeId, heights) => {
    const { networkMemory } = get();
    const node = networkMemory.get(nodeId);
    
    if (!node) return;

    // Merge content from specified heights
    let mergedContent = node.baseContent;
    heights.forEach(height => {
      const branch = node.branches.get(height);
      if (branch) {
        mergedContent = `${mergedContent}\n---\n${branch.content}`;
      }
    });

    // Update base content and clear merged branches
    set(state => {
      const updatedNode = {
        ...node,
        baseContent: mergedContent,
        branches: new Map([...node.branches].filter(([h]) => !heights.includes(h)))
      };

      return {
        networkMemory: new Map(state.networkMemory).set(nodeId, updatedNode)
      };
    });
  },

  syncWithNetwork: (instanceId) => {
    // Implement network synchronization logic
    console.log('Syncing with network:', instanceId);
  },

  broadcastChanges: (changes) => {
    // Implement change broadcasting logic
    console.log('Broadcasting changes:', changes);
  },

  // Helper method to update node metrics
  updateNodeMetrics: (nodeId: string, updates: Partial<MemoryNode['metrics']>) => {
    set(state => {
      const node = state.personalMemory.get(nodeId);
      if (!node) return state;

      const updatedNode = {
        ...node,
        metrics: { ...node.metrics, ...updates }
      };

      return {
        personalMemory: new Map(state.personalMemory).set(nodeId, updatedNode)
      };
    });
  }
}));