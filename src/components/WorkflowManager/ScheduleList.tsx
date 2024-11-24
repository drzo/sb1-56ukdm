import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { WorkflowTrigger } from '../../types/workflow';

export const ScheduleList: React.FC = () => {
  const schedules = useWorkflowStore((state) => state.schedules);
  const addSchedule = useWorkflowStore((state) => state.addSchedule);

  const handleAddSchedule = (trigger: WorkflowTrigger) => {
    addSchedule({
      trigger,
      state: 'sleeping',
      cronExpression: '0 * * * *', // Every hour
      threshold: 0.75
    });
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Schedules</h3>
      
      <div className="space-y-2 mb-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="p-3 bg-gray-800 rounded-lg flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium text-white">
                {schedule.trigger}
              </div>
              <div className="text-xs text-gray-400">
                Next run: {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'Not scheduled'}
              </div>
            </div>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
        ))}
      </div>

      <button
        onClick={() => handleAddSchedule('cron')}
        className="flex items-center justify-center w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Schedule
      </button>
    </div>
  );
};