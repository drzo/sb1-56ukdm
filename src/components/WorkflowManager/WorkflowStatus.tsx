import React from 'react';
import { Brain, Clock, Activity } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { format } from 'date-fns';

export const WorkflowStatus: React.FC = () => {
  const currentState = useWorkflowStore((state) => state.currentState);
  const currentSession = useWorkflowStore((state) => 
    state.sessions.find(s => !s.endTime)
  );
  const pendingTasks = useWorkflowStore((state) => 
    state.tasks.filter(t => t.status === 'pending')
  );

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Workflow Status</h2>
        </div>
        <div className="px-3 py-1 rounded-full bg-purple-500 text-white text-sm">
          {currentState}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Session Time</span>
          </div>
          <div className="text-xl font-bold text-white">
            {currentSession ? format(currentSession.startTime, 'HH:mm:ss') : '--:--:--'}
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Pending Tasks</span>
          </div>
          <div className="text-xl font-bold text-white">
            {pendingTasks.length}
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Learning Progress</span>
          </div>
          <div className="text-xl font-bold text-white">
            {currentSession?.progress.completed.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};