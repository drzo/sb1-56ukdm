import React from 'react';
import { AgentOrchestration } from '../components/AgentOrchestration';

export function Agents() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Agent Orchestration</h1>
      <AgentOrchestration />
    </div>
  );
}