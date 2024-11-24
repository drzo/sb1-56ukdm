import React from 'react';
import { SecurityDemo } from '../components/SecurityDemo';

export function Security() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Security</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Encryption Test
            </h2>
            <SecurityDemo />
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Access Control
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Two-Factor Authentication
                </span>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  API Key Management
                </span>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Manage Keys
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Audit Logs
                </span>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  View Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}