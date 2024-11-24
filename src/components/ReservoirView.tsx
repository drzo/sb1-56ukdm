import React from 'react';
import { useStore } from '../store';
import { Reservoir } from '../types';

const mockReservoirs: Reservoir[] = [
  {
    id: 'root',
    name: 'Root Reservoir',
    type: 'root',
    status: 'active',
    performance: 0.95,
    children: ['child1', 'child2']
  },
  {
    id: 'child1',
    name: 'Child Reservoir 1',
    type: 'child',
    status: 'active',
    performance: 0.88
  },
  {
    id: 'child2',
    name: 'Child Reservoir 2',
    type: 'child',
    status: 'inactive',
    performance: 0.75
  }
];

export default function ReservoirView() {
  return (
    <div className="h-full bg-white overflow-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Neural Reservoirs</h2>
        <div className="grid gap-6">
          {mockReservoirs.map((reservoir) => (
            <div
              key={reservoir.id}
              className="bg-gray-50 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{reservoir.name}</h3>
                  <span className="text-sm text-gray-500 capitalize">
                    {reservoir.type} Reservoir
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    reservoir.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {reservoir.status}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Performance</span>
                  <span className="text-sm font-medium">
                    {(reservoir.performance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${reservoir.performance * 100}%` }}
                  />
                </div>
              </div>

              {reservoir.children && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Child Reservoirs
                  </h4>
                  <div className="flex gap-2">
                    {reservoir.children.map((childId) => (
                      <span
                        key={childId}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                      >
                        {childId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}