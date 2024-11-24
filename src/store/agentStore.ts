import { create } from 'zustand';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'active' | 'busy';
  instructions: string;
  tools: string[];
}

interface AgentStore {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgentStatus: (id: string, status: 'idle' | 'active' | 'busy') => void;
  handoffToAgent: (fromId: string, toId: string, reason: string) => void;
  routineHistory: { fromAgent: string; toAgent: string; reason: string }[];
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [
    {
      id: 'agent-1',
      name: 'Triage Agent',
      role: 'triage',
      status: 'idle',
      instructions: 'Route incoming requests to appropriate agents',
      tools: ['analyze', 'route', 'escalate'],
    },
    {
      id: 'agent-2',
      name: 'Task Agent',
      role: 'executor',
      status: 'idle',
      instructions: 'Execute assigned tasks and report results',
      tools: ['execute', 'report', 'request_help'],
    },
    {
      id: 'agent-3',
      name: 'Support Agent',
      role: 'support',
      status: 'idle',
      instructions: 'Provide assistance and handle escalations',
      tools: ['assist', 'document', 'resolve'],
    },
  ],
  routineHistory: [],
  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),
  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, status } : agent
      ),
    })),
  handoffToAgent: (fromId, toId, reason) =>
    set((state) => {
      const fromAgent = state.agents.find((a) => a.id === fromId)?.name || '';
      const toAgent = state.agents.find((a) => a.id === toId)?.name || '';
      return {
        agents: state.agents.map((agent) => ({
          ...agent,
          status:
            agent.id === fromId
              ? 'idle'
              : agent.id === toId
              ? 'active'
              : agent.status,
        })),
        routineHistory: [
          ...state.routineHistory,
          { fromAgent, toAgent, reason },
        ],
      };
    }),
}));