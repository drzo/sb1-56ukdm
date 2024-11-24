import { create } from 'zustand';
import { MemoryNode, Connection, ConnectionType, MemoryInstance } from '../types/memory';
import { SheafNode } from '../types/sheaf';

interface MemoryState {
  nodes: MemoryNode[];
  sheafNodes: Map<string, SheafNode>;
  instances: MemoryInstance[];
  currentInstance: MemoryInstance;
  selectedNode: string | null;
  connectionMode: {
    active: boolean;
    sourceId: string | null;
    type: ConnectionType | null;
  };

  // Node operations
  addNode: (node: Omit<MemoryNode, 'id' | 'timestamp' | 'instance'>) => void;
  updateNode: (id: string, updates: Partial<MemoryNode>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  // Connection operations
  startConnection: (sourceId: string, type: ConnectionType) => void;
  completeConnection: (targetId: string) => void;
  cancelConnection: () => void;
  removeConnection: (sourceId: string, targetId: string) => void;

  // Instance operations
  addInstance: (instance: Omit<MemoryInstance, 'id'>) => void;
  setCurrentInstance: (instanceId: string) => void;
}

const DEFAULT_INSTANCE: MemoryInstance = {
  id: 'bolt-default',
  type: 'bolt',
  platform: 'stackblitz',
  height: 0,
  created: Date.now()
};

export const useMemoryStore = create<MemoryState>((set, get) => ({
  nodes: [],
  sheafNodes: new Map(),
  instances: [DEFAULT_INSTANCE],
  currentInstance: DEFAULT_INSTANCE,
  selectedNode: null,
  connectionMode: {
    active: false,
    sourceId: null,
    type: null,
  },

  addNode: (node) =>
    set((state) => {
      const id = Math.random().toString(36).substr(2, 9);
      const timestamp = Date.now();

      // Create memory node
      const newNode: MemoryNode = {
        ...node,
        id,
        timestamp,
        instance: state.currentInstance,
        metrics: {
          strength: 1,
          depth: 0,
          energy: Math.random() * 100,
          resonance: Math.random() * 100,
          attention: 1,
        },
        connections: []
      };

      // Create corresponding sheaf node
      const sheafNode: SheafNode = {
        id,
        baseContent: node.content,
        branches: new Map([[state.currentInstance.height, {
          content: node.content,
          timestamp,
          instanceId: state.currentInstance.id
        }]]),
        connections: []
      };

      return {
        nodes: [...state.nodes, newNode],
        sheafNodes: new Map(state.sheafNodes).set(id, sheafNode)
      };
    }),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      selectedNode: state.selectedNode === id ? null : state.selectedNode,
      connectionMode: state.connectionMode.sourceId === id ? 
        { active: false, sourceId: null, type: null } : 
        state.connectionMode,
    })),

  selectNode: (id) =>
    set((state) => ({
      selectedNode: id,
      connectionMode: { active: false, sourceId: null, type: null },
    })),

  startConnection: (sourceId, type) =>
    set({
      connectionMode: {
        active: true,
        sourceId,
        type,
      },
    }),

  completeConnection: (targetId) =>
    set((state) => {
      if (!state.connectionMode.active || !state.connectionMode.sourceId || !state.connectionMode.type) {
        return state;
      }

      const sourceNode = state.nodes.find(n => n.id === state.connectionMode.sourceId);
      
      // Don't connect to self or if connection already exists
      if (!sourceNode || 
          targetId === state.connectionMode.sourceId || 
          sourceNode.connections.some(c => c.targetId === targetId)) {
        return {
          ...state,
          connectionMode: { active: false, sourceId: null, type: null }
        };
      }

      const newConnection: Connection = {
        targetId,
        type: state.connectionMode.type,
        strength: 1,
        sourceHeight: sourceNode.instance.height,
        targetHeight: state.nodes.find(n => n.id === targetId)?.instance.height || 0
      };

      return {
        ...state,
        nodes: state.nodes.map((node) =>
          node.id === state.connectionMode.sourceId
            ? {
                ...node,
                connections: [...node.connections, newConnection],
              }
            : node
        ),
        connectionMode: {
          active: false,
          sourceId: null,
          type: null,
        },
      };
    }),

  cancelConnection: () =>
    set({
      connectionMode: {
        active: false,
        sourceId: null,
        type: null,
      },
    }),

  removeConnection: (sourceId, targetId) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === sourceId
          ? {
              ...node,
              connections: node.connections.filter(
                (conn) => conn.targetId !== targetId
              ),
            }
          : node
      ),
    })),

  addInstance: (instance) =>
    set((state) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newInstance = { ...instance, id };
      return {
        instances: [...state.instances, newInstance]
      };
    }),

  setCurrentInstance: (instanceId) =>
    set((state) => {
      const instance = state.instances.find(i => i.id === instanceId);
      return instance ? { currentInstance: instance } : state;
    })
}));