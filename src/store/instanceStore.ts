import { create } from 'zustand';
import { InstanceConfig, NetworkMessage, InstanceState } from '../types/instance';

interface InstanceStoreState {
  instances: Map<string, InstanceConfig>;
  messages: NetworkMessage[];
  instanceStates: Map<string, InstanceState>;
  
  // Instance Management
  addInstance: (config: Omit<InstanceConfig, 'id'>) => string;
  removeInstance: (id: string) => void;
  updateInstanceConfig: (id: string, updates: Partial<InstanceConfig>) => void;
  
  // Message Handling
  sendMessage: (message: Omit<NetworkMessage, 'id' | 'timestamp'>) => void;
  getMessages: (instanceId: string) => NetworkMessage[];
  
  // State Management
  updateInstanceState: (id: string, updates: Partial<InstanceState>) => void;
  getActiveInstances: () => InstanceConfig[];
}

export const useInstanceStore = create<InstanceStoreState>((set, get) => ({
  instances: new Map(),
  messages: [],
  instanceStates: new Map(),

  addInstance: (config) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newInstance: InstanceConfig = { ...config, id };
    
    const initialState: InstanceState = {
      id,
      status: 'idle',
      lastActive: Date.now(),
      metrics: {
        resonance: 0,
        attention: 0,
        energy: 100
      }
    };

    set(state => ({
      instances: new Map(state.instances).set(id, newInstance),
      instanceStates: new Map(state.instanceStates).set(id, initialState)
    }));

    return id;
  },

  removeInstance: (id) => {
    set(state => {
      const newInstances = new Map(state.instances);
      const newStates = new Map(state.instanceStates);
      newInstances.delete(id);
      newStates.delete(id);
      return { instances: newInstances, instanceStates: newStates };
    });
  },

  updateInstanceConfig: (id, updates) => {
    set(state => {
      const instance = state.instances.get(id);
      if (!instance) return state;

      return {
        instances: new Map(state.instances).set(id, { ...instance, ...updates })
      };
    });
  },

  sendMessage: (message) => {
    const newMessage: NetworkMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    set(state => ({
      messages: [...state.messages, newMessage]
    }));

    // Update instance state
    const instance = get().instanceStates.get(message.instanceId);
    if (instance) {
      get().updateInstanceState(message.instanceId, {
        status: 'active',
        lastActive: Date.now(),
        metrics: {
          ...instance.metrics,
          energy: Math.max(0, instance.metrics.energy - 5),
          resonance: instance.metrics.resonance + 2
        }
      });
    }
  },

  getMessages: (instanceId) => {
    return get().messages.filter(m => m.instanceId === instanceId);
  },

  updateInstanceState: (id, updates) => {
    set(state => {
      const currentState = state.instanceStates.get(id);
      if (!currentState) return state;

      return {
        instanceStates: new Map(state.instanceStates).set(id, {
          ...currentState,
          ...updates,
          metrics: {
            ...currentState.metrics,
            ...(updates.metrics || {})
          }
        })
      };
    });
  },

  getActiveInstances: () => {
    const { instances, instanceStates } = get();
    return Array.from(instances.values()).filter(instance => {
      const state = instanceStates.get(instance.id);
      return state && state.status !== 'idle';
    });
  }
}));