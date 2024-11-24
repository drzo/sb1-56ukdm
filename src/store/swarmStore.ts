import { create } from 'zustand';

interface SwarmNode {
  id: string;
  hostname: string;
  role: 'manager' | 'worker';
  status: 'ready' | 'down';
  cpu: number;
  memory: number;
  disk: number;
}

interface SwarmService {
  id: string;
  name: string;
  image: string;
  replicas: number;
  status: 'running' | 'stopped' | 'failed';
  ports: string[];
  env: Record<string, string>;
}

interface SwarmStore {
  nodes: SwarmNode[];
  services: SwarmService[];
  addNode: (node: SwarmNode) => void;
  removeNode: (id: string) => void;
  updateNodeStatus: (id: string, status: 'ready' | 'down') => void;
  addService: (service: SwarmService) => void;
  removeService: (id: string) => void;
  updateService: (id: string, updates: Partial<SwarmService>) => void;
  scaleService: (id: string, replicas: number) => void;
}

export const useSwarmStore = create<SwarmStore>((set) => ({
  nodes: [
    {
      id: 'node-1',
      hostname: 'swarm-manager-1',
      role: 'manager',
      status: 'ready',
      cpu: 45,
      memory: 60,
      disk: 30,
    },
    {
      id: 'node-2',
      hostname: 'swarm-worker-1',
      role: 'worker',
      status: 'ready',
      cpu: 30,
      memory: 40,
      disk: 25,
    },
  ],
  services: [
    {
      id: 'svc-1',
      name: 'web-frontend',
      image: 'nginx:latest',
      replicas: 3,
      status: 'running',
      ports: ['80:80'],
      env: { NODE_ENV: 'production' },
    },
  ],
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),
  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
    })),
  updateNodeStatus: (id, status) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, status } : node
      ),
    })),
  addService: (service) =>
    set((state) => ({
      services: [...state.services, service],
    })),
  removeService: (id) =>
    set((state) => ({
      services: state.services.filter((service) => service.id !== id),
    })),
  updateService: (id, updates) =>
    set((state) => ({
      services: state.services.map((service) =>
        service.id === id ? { ...service, ...updates } : service
      ),
    })),
  scaleService: (id, replicas) =>
    set((state) => ({
      services: state.services.map((service) =>
        service.id === id ? { ...service, replicas } : service
      ),
    })),
}));