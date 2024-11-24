import React, { useState, useEffect } from 'react';
import { Database, Command, Brain, List } from 'lucide-react';
import { useStore } from '../store';
import { Task, ChatHistoryEntry, Skill, Hotkey } from '../types';
import { initDB, getTasks, getChatHistory, getSkills, initializeDefaultSkills } from '../utils/db';

export default function ConfigView() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat' | 'skills' | 'hotkeys'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hotkeys: Hotkey[] = [
    { command: 'w', description: 'Continue, yes', previewPrompt: 'Continue with current action' },
    { command: 'a', description: 'Compare alternatives', previewPrompt: 'Compare 3 alternative approaches' },
    { command: 's', description: 'Undo, no', previewPrompt: 'Undo last action' },
    { command: 'd', description: 'Repeat previous', previewPrompt: 'Repeat previous action' },
    { command: 'q', description: 'Build intuition', previewPrompt: 'Help me understand this better', hidden: true },
    { command: 'e', description: 'Expand details', previewPrompt: 'Provide more details', hidden: true },
    { command: 'f', description: 'Fast mode', previewPrompt: 'Give me a quick summary', hidden: true },
    { command: 'j', description: 'Step by step', previewPrompt: 'Break this down into steps', hidden: true },
    { command: 'g', description: 'Google search', previewPrompt: 'Generate search queries', hidden: true },
    { command: 'm', description: 'Memory client', previewPrompt: 'Access memory database', hidden: true },
    { command: 't', description: 'Tasks', previewPrompt: 'Show current tasks', hidden: true },
    { command: 'c', description: 'Curriculum', previewPrompt: 'Generate learning tasks', hidden: true },
    { command: 'p', description: 'Print DB', previewPrompt: 'Show database contents', hidden: true },
    { command: 'x', description: 'Export data', previewPrompt: 'Export current state', hidden: true },
    { command: 'xk', description: 'Save skill', previewPrompt: 'Save new skill', hidden: true },
    { command: 'k', description: 'Show hotkeys', previewPrompt: 'Show all available hotkeys', hidden: true },
    { command: 'z', description: 'Wild idea', previewPrompt: 'Generate a creative suggestion', hidden: true }
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);

      await initDB();
      const [loadedTasks, loadedHistory, loadedSkills] = await Promise.all([
        getTasks(),
        getChatHistory(),
        getSkills()
      ]);

      setTasks(loadedTasks);
      setChatHistory(loadedHistory);
      setSkills(loadedSkills);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load configuration data');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="border-b">
        <nav className="flex space-x-4 px-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-5 h-5 mr-2" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Database className="w-5 h-5 mr-2" />
            Chat History
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center ${
              activeTab === 'skills'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Brain className="w-5 h-5 mr-2" />
            Skills
          </button>
          <button
            onClick={() => setActiveTab('hotkeys')}
            className={`py-4 px-2 border-b-2 font-medium flex items-center ${
              activeTab === 'hotkeys'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Command className="w-5 h-5 mr-2" />
            Hotkeys
          </button>
        </nav>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Task Management</h3>
            {tasks.length === 0 ? (
              <p className="text-gray-500">No tasks available.</p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Chat History</h3>
            {chatHistory.length === 0 ? (
              <p className="text-gray-500">No chat history available.</p>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((entry) => (
                  <div key={entry.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{entry.content}</p>
                    {entry.summary && (
                      <p className="text-sm text-gray-500 mt-2">Summary: {entry.summary}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Skills Library</h3>
              <button
                onClick={() => initializeDefaultSkills()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Initialize Default Skills
              </button>
            </div>
            {skills.length === 0 ? (
              <p className="text-gray-500">No skills available.</p>
            ) : (
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{skill.command}</h4>
                        <p className="text-sm text-gray-600">{skill.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        skill.status === 'mastered'
                          ? 'bg-green-100 text-green-800'
                          : skill.status === 'practicing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {skill.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Level {skill.level}</span>
                        <span>{skill.experience}/{skill.experienceRequired} XP</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(skill.experience / skill.experienceRequired) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    {skill.learningPaths && skill.learningPaths.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium mb-2">Learning Paths</h5>
                        <div className="space-y-2">
                          {skill.learningPaths.map((path) => (
                            <div key={path.id} className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="text-sm font-medium">{path.name}</h6>
                                  <p className="text-xs text-gray-600">{path.description}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  path.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : path.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {path.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'hotkeys' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Hotkey Configuration</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {hotkeys.map((hotkey) => (
                <div
                  key={hotkey.command}
                  className={`bg-gray-50 p-4 rounded-lg ${
                    hotkey.hidden ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-sm font-mono">
                      {hotkey.command}
                    </kbd>
                    {hotkey.hidden && (
                      <span className="text-xs text-gray-500">Hidden</span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{hotkey.description}</p>
                  <p className="text-xs text-gray-600 mt-1">{hotkey.previewPrompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}