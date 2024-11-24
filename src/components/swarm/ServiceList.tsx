import React, { useState } from 'react';
import { useSwarmStore } from '../../store/swarmStore';
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

export function ServiceList() {
  const { services, scaleService, removeService, updateService } = useSwarmStore();
  const [editingService, setEditingService] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="bg-white rounded-lg shadow p-4 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500">Image: {service.image}</p>
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                service.status === 'running'
                  ? 'bg-green-100 text-green-800'
                  : service.status === 'stopped'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {service.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Ports</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {service.ports.map((port) => (
                  <span
                    key={port}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 rounded"
                  >
                    {port}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Environment</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(service.env).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 rounded"
                  >
                    {key}={value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => scaleService(service.id, service.replicas - 1)}
                disabled={service.replicas <= 1}
                className="p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                <MinusIcon className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium">{service.replicas} replicas</span>
              <button
                onClick={() => scaleService(service.id, service.replicas + 1)}
                className="p-1 text-gray-400 hover:text-gray-500"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setEditingService(service.id)}
                className="p-2 text-blue-600 hover:text-blue-700"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => removeService(service.id)}
                className="p-2 text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}