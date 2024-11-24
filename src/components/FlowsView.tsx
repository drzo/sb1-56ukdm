import React, { useState, useEffect } from 'react';
import { Clock, Code, Users } from 'lucide-react'; // Changed Function to Code
import { useStore } from '../store';
import { WorkflowTrigger, MemoryFunction, TeamActivity } from '../types';
import { getTriggers, getMemoryFunctions, getTeamActivities } from '../utils/db';

export default function FlowsView() {
  const [activeTab, setActiveTab] = useState<'triggers' | 'functions' | 'activities'>('triggers');
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([]);
  const [functions, setFunctions] = useState<MemoryFunction[]>([]);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [isAddingTrigger, setIsAddingTrigger] = useState(false);
  const [isAddingFunction, setIsAddingFunction] = useState(false);
  const [newTrigger, setNewTrigger] = useState({ cronExpression: '' });
  const [newFunction, setNewFunction] = useState({ name: '', description: '', code: '' });

  useEffect(() => {
    async function loadData() {
      const loadedTriggers = await getTriggers();
      const loadedFunctions = await getMemoryFunctions();
      const loadedActivities = await getTeamActivities();
      
      setTriggers(loadedTriggers);
      setFunctions(loadedFunctions);
      setActivities(loadedActivities);
    }

    loadData();
  }, []);

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="border-b">
        <nav className="flex space-x-4 px-6">
          <button
            onClick={() => setActiveTab('triggers')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center ${
              activeTab === 'triggers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-5 h-5 mr-2" />
            Workflow Triggers
          </button>
          <button
            onClick={() => setActiveTab('functions')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center ${
              activeTab === 'functions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="w-5 h-5 mr-2" /> {/* Changed from Function to Code */}
            Memory Functions
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center ${
              activeTab === 'activities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Team Activities
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'triggers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Workflow Triggers</h3>
              <button
                onClick={() => setIsAddingTrigger(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Trigger
              </button>
            </div>

            {isAddingTrigger && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <input
                  type="text"
                  value={newTrigger.cronExpression}
                  onChange={(e) => setNewTrigger({ cronExpression: e.target.value })}
                  placeholder="Cron expression (e.g., */15 * * * *)"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsAddingTrigger(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Add trigger logic
                      setIsAddingTrigger(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {triggers.map((trigger) => (
                <div key={trigger.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {trigger.cronExpression}
                    </code>
                    <span className={`ml-2 text-sm ${
                      trigger.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trigger.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        // Toggle trigger logic
                      }}
                      className={`px-3 py-1 rounded-md text-white ${
                        trigger.isActive ? 'bg-red-600' : 'bg-green-600'
                      }`}
                    >
                      {trigger.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => {
                        // Delete trigger logic
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'functions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Memory Functions</h3>
              <button
                onClick={() => setIsAddingFunction(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Function
              </button>
            </div>

            {isAddingFunction && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <input
                  type="text"
                  value={newFunction.name}
                  onChange={(e) => setNewFunction({ ...newFunction, name: e.target.value })}
                  placeholder="Function name"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <textarea
                  value={newFunction.description}
                  onChange={(e) => setNewFunction({ ...newFunction, description: e.target.value })}
                  placeholder="Description"
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                />
                <textarea
                  value={newFunction.code}
                  onChange={(e) => setNewFunction({ ...newFunction, code: e.target.value })}
                  placeholder="Function code"
                  className="w-full px-3 py-2 border rounded-md font-mono"
                  rows={4}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsAddingFunction(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Add function logic
                      setIsAddingFunction(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {functions.map((func) => (
                <div key={func.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium">{func.name}</h4>
                      <p className="text-sm text-gray-600">{func.description}</p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          // Toggle function logic
                        }}
                        className={`px-3 py-1 rounded-md text-white ${
                          func.isEnabled ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      >
                        {func.isEnabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => {
                          // Delete function logic
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                    {func.code}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Team Activities</h3>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{activity.name}</h4>
                      <span className="text-sm text-gray-600 capitalize">{activity.type}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      activity.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-600">Assigned to:</h5>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activity.assignedTo.map((member) => (
                        <span
                          key={member}
                          className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}