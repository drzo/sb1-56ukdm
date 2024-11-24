import React from 'react';
import { MessageSquare, Brain, Network, History, Settings, Link, Users, Book, Globe, Cpu } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Deep Tree Echo</h1>
      </div>
      <nav className="p-4 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-medium rounded-lg ${
              isActive
                ? 'text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`
          }
        >
          <MessageSquare className="w-5 h-5" />
          Chat Interface
        </NavLink>
        <NavLink
          to="/characters"
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-medium rounded-lg ${
              isActive
                ? 'text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`
          }
        >
          <Users className="w-5 h-5" />
          Characters
        </NavLink>
        <NavLink
          to="/storytelling"
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-medium rounded-lg ${
              isActive
                ? 'text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`
          }
        >
          <Book className="w-5 h-5" />
          Story Telling
        </NavLink>
        <NavLink
          to="/world-building"
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-medium rounded-lg ${
              isActive
                ? 'text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`
          }
        >
          <Globe className="w-5 h-5" />
          World Building
        </NavLink>
        <NavLink
          to="/system-model"
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-medium rounded-lg ${
              isActive
                ? 'text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`
          }
        >
          <Cpu className="w-5 h-5" />
          System Model
        </NavLink>
        <NavLink
          to="/neural-network"
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-medium rounded-lg ${
              isActive
                ? 'text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`
          }
        >
          <Network className="w-5 h-5" />
          Neural Network
        </NavLink>
        <NavLink
          to="/memory-store"
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-medium rounded-lg ${
              isActive
                ? 'text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`
          }
        >
          <History className="w-5 h-5" />
          Memory Store
        </NavLink>
        <NavLink
          to="/integrations"
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-medium rounded-lg ${
              isActive
                ? 'text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`
          }
        >
          <Link className="w-5 h-5" />
          Integrations
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-medium rounded-lg ${
              isActive
                ? 'text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/50'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}