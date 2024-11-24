import React from 'react';
import { useStore } from '../store';
import { PSystem } from '../types';

const mockPSystems: PSystem[] = [
  {
    id: 'ps1',
    name: 'Primary P-System',
    membranes: 5,
    rules: [
      'Membrane Division',
      'Object Evolution',
      'Membrane Dissolution'
    ],
    status: 'stable'
  },
  {
    id: 'ps2',
    name: 'Secondary P-System',
    membranes: 3,
    rules: [
      'Object Communication',
      'Membrane Creation'
    ],
    status: 'optimizing'
  }
];

export default function PSystemView() {
  return (
    <div className="h-full bg-white overflow-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">P-Systems</h2>
        <div className="grid gap-6">
          {mockPSystems.map((psystem) => (
            <div
              key={psystem.id}
              className="bg-gray-50 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{psystem.name}</h3>
                  <span className="text-sm text-gray-500">
                    {psystem.membranes} Membranes
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    psystem.status === 'stable'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {psystem.status}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Active Rules
                </h4>
                <div className="space-y-2">
                  {psystem.rules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-white rounded border border-gray-200"
                    >
                      <span className="text-sm">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}