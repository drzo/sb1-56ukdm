import React from 'react';
import { Brain, Clock, Activity } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { format } from 'date-fns';

export const SessionMonitor: React.FC = () => {
  const currentSession = useWorkflowStore((state) => 
    state.sessions.find(s => !s.endTime)
  );
  const currentState = useWorkflowStore((state) => state.currentState);

  if (!currentSession) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Session Monitor</h3>
        <div className="text-center text-gray-400 py-4">
          No active session
        </div>
      </div>
    );
  }

  const sessionDuration = Date.now() - currentSession.startTime;
  const hours = Math.floor(sessionDuration / 3600000);
  const minutes = Math.floor((sessionDuration % 3600000) / 60000);
  const seconds = Math.floor((sessionDuration % 60000) / 1000);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Session Monitor</h3>
        <div className="px-3 py-1 rounded-full bg-purple-500 text-white text-sm">
          {currentState}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Duration</span>
          </div>
          <div className="text-xl font-bold text-white">
            {`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Progress</span>
          </div>
          <div className="text-xl font-bold text-white">
            {currentSession.progress.completed.length} / {currentSession.objectives.length}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300">Objectives</h4>
        {currentSession.objectives.map((objective, index) => (
          <div
            key={index}
            className="p-2 bg-gray-800 rounded-lg flex items-center space-x-2"
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white">{objective}</span>
          </div>
        ))}
      </div>
    </div>
  );
};