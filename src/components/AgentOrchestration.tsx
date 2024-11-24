import React from 'react';
import { useAgentStore } from '../store/agentStore';

export function AgentOrchestration() {
  const { agents, routineHistory, updateAgentStatus, handoffToAgent } = useAgentStore();

  const handleHandoff = (fromId: string, toId: string) => {
    handoffToAgent(fromId, toId, 'Manual handoff initiated');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white p-4 rounded-lg shadow space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{agent.name}</h3>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  agent.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : agent.status === 'busy'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {agent.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">{agent.instructions}</p>
            <div className="flex flex-wrap gap-2">
              {agent.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                >
                  {tool}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              {agents
                .filter((a) => a.id !== agent.id)
                .map((targetAgent) => (
                  <button
                    key={targetAgent.id}
                    onClick={() => handleHandoff(agent.id, targetAgent.id)}
                    className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Handoff to {targetAgent.name}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Routine History</h3>
        <div className="space-y-2">
          {routineHistory.map((handoff, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-sm text-gray-600"
            >
              <span>{handoff.fromAgent}</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              <span>{handoff.toAgent}</span>
              <span className="text-gray-400">({handoff.reason})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}