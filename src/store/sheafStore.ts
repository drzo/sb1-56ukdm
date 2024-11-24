import { create } from 'zustand';
import { SheafNode, HeightIndexedNode, MemoryBranch } from '../types/sheaf';
import { MemoryInstance } from '../types/memory';

interface SheafState {
  sheafNodes: Map<string, SheafNode>;
  currentInstance: MemoryInstance;
  
  // Node operations
  createNode: (content: string, type: string) => string;
  updateBranch: (nodeId: string, content: string) => void;
  mergeBranches: (nodeId: string, heights: number[]) => void;
  propagateChanges: (nodeId: string) => void;
  
  // Branch operations
  getBranch: (nodeId: string, height: number) => MemoryBranch | undefined;
  setBranch: (nodeId: string, branch: MemoryBranch) => void;
  
  // Resonance calculations
  calculateResonance: (sourceHeight: number, targetHeight: number) => number;
  updateNodeResonance: (nodeId: string) => void;
}

export const useSheafStore = create<SheafState>((set, get) => ({
  sheafNodes: new Map(),
  currentInstance: {
    id: 'default',
    type: 'bolt',
    platform: 'stackblitz',
    height: 0,
    created: Date.now()
  },

  createNode: (content, type) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { currentInstance } = get();
    
    const newNode: SheafNode = {
      id,
      baseContent: content,
      branches: new Map([[currentInstance.height, {
        content,
        timestamp: Date.now(),
        instanceId: currentInstance.id,
        metrics: {
          energy: 100,
          resonance: 0,
          attention: 1
        }
      }]]),
      connections: []
    };

    set(state => ({
      sheafNodes: new Map(state.sheafNodes).set(id, newNode)
    }));

    return id;
  },

  updateBranch: (nodeId, content) => {
    const { currentInstance, sheafNodes } = get();
    const node = sheafNodes.get(nodeId);
    
    if (!node) return;

    const updatedNode = {
      ...node,
      branches: new Map(node.branches).set(currentInstance.height, {
        content,
        timestamp: Date.now(),
        instanceId: currentInstance.id,
        metrics: {
          energy: 100,
          resonance: 0,
          attention: 1
        }
      })
    };

    set(state => ({
      sheafNodes: new Map(state.sheafNodes).set(nodeId, updatedNode)
    }));

    // Propagate changes to connected nodes
    get().propagateChanges(nodeId);
  },

  mergeBranches: (nodeId, heights) => {
    const { sheafNodes } = get();
    const node = sheafNodes.get(nodeId);
    
    if (!node) return;

    // Find the most resonant branch
    let mostResonantBranch: MemoryBranch = {
      content: node.baseContent,
      timestamp: Date.now(),
      instanceId: '',
      metrics: { energy: 0, resonance: 0, attention: 0 }
    };

    heights.forEach(height => {
      const branch = node.branches.get(height);
      if (branch && branch.metrics.resonance > mostResonantBranch.metrics.resonance) {
        mostResonantBranch = branch;
      }
    });

    // Update base content and clear merged branches
    const updatedNode = {
      ...node,
      baseContent: mostResonantBranch.content,
      branches: new Map([...node.branches].filter(([h]) => !heights.includes(h)))
    };

    set(state => ({
      sheafNodes: new Map(state.sheafNodes).set(nodeId, updatedNode)
    }));
  },

  propagateChanges: (nodeId) => {
    const { sheafNodes } = get();
    const node = sheafNodes.get(nodeId);
    
    if (!node) return;

    // Propagate changes through connections
    node.connections.forEach(conn => {
      const targetNode = sheafNodes.get(conn.targetId);
      if (!targetNode) return;

      // Calculate resonance based on height difference
      const resonance = get().calculateResonance(conn.sourceHeight, conn.targetHeight);

      // Update target branch metrics
      const targetBranch = targetNode.branches.get(conn.targetHeight);
      if (targetBranch) {
        const updatedBranch = {
          ...targetBranch,
          metrics: {
            ...targetBranch.metrics,
            resonance: targetBranch.metrics.resonance + (resonance * conn.strength)
          }
        };

        get().setBranch(conn.targetId, updatedBranch);
      }
    });
  },

  getBranch: (nodeId, height) => {
    const { sheafNodes } = get();
    const node = sheafNodes.get(nodeId);
    return node?.branches.get(height);
  },

  setBranch: (nodeId, branch) => {
    const { sheafNodes } = get();
    const node = sheafNodes.get(nodeId);
    
    if (!node) return;

    const updatedNode = {
      ...node,
      branches: new Map(node.branches).set(branch.height, branch)
    };

    set(state => ({
      sheafNodes: new Map(state.sheafNodes).set(nodeId, updatedNode)
    }));

    // Update resonance after branch update
    get().updateNodeResonance(nodeId);
  },

  calculateResonance: (sourceHeight: number, targetHeight: number) => {
    // Calculate resonance based on height difference
    // Closer heights have higher resonance
    const heightDiff = Math.abs(sourceHeight - targetHeight);
    return Math.exp(-heightDiff * 0.1); // Exponential decay with height difference
  },

  updateNodeResonance: (nodeId: string) => {
    const { sheafNodes } = get();
    const node = sheafNodes.get(nodeId);
    
    if (!node) return;

    // Calculate average resonance across all branches
    const totalResonance = Array.from(node.branches.values()).reduce(
      (sum, branch) => sum + branch.metrics.resonance,
      0
    );
    const avgResonance = totalResonance / node.branches.size;

    // Update all branches with new resonance value
    node.branches.forEach((branch, height) => {
      const heightFactor = get().calculateResonance(height, Array.from(node.branches.keys())[0]);
      const updatedBranch = {
        ...branch,
        metrics: {
          ...branch.metrics,
          resonance: avgResonance * heightFactor
        }
      };
      get().setBranch(nodeId, updatedBranch);
    });
  }
}));