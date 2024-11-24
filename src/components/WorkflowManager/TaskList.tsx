import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { WorkflowTask } from '../../types/workflow';

export const TaskList: React.FC = () => {
  const tasks = useWorkflowStore((state) => state.tasks);
  const updateTask = useWorkflowStore((state) => state.updateTask);

  const handleTaskComplete = (taskId: string) => {
    updateTask(taskId, { status: 'completed' });
  };

  const getTaskIcon = (task: WorkflowTask) => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Circle className="w-5 h-5 text-blue-400" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Current Tasks</h3>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3 bg-gray-800 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {getTaskIcon(task)}
              <div>
                <div className="text-sm font-medium text-white">
                  {task.type}
                </div>
                <div className="text-xs text-gray-400">
                  Priority: {task.priority}
                </div>
              </div>
            </div>
            
            {task.status === 'pending' && (
              <button
                onClick={() => handleTaskComplete(task.id)}
                className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
              >
                Complete
              </button>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            No active tasks
          </div>
        )}
      </div>
    </div>
  );
};