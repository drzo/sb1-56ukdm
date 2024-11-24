import React from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { ScheduleList } from './ScheduleList';
import { TaskManager } from './TaskManager';
import { SessionMonitor } from './SessionMonitor';
import { NetworkHub } from './NetworkHub';

export const WorkflowManager: React.FC = () => {
  const currentState = useWorkflowStore((state) => state.currentState);
  const schedules = useWorkflowStore((state) => state.schedules);
  const tasks = useWorkflowStore((state) => state.tasks);

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Workflow Status</h2>
          <div className="px-3 py-1 rounded-full bg-purple-500 text-white text-sm">
            {currentState}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400">Active Schedules</div>
            <div className="text-2xl font-bold text-white">
              {schedules.length}
            </div>
          </div>
          
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400">Pending Tasks</div>
            <div className="text-2xl font-bold text-white">
              {tasks.filter(t => t.status === 'pending').length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ScheduleList />
        <TaskManager />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SessionMonitor />
        <NetworkHub />
      </div>
    </div>
  );
};