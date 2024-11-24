import React, { useState } from 'react';
import { useSwarmStore } from '../../store/swarmStore';

interface FormData {
  name: string;
  image: string;
  replicas: number;
  ports: string;
  env: string;
}

export function DeploymentForm() {
  const { addService } = useSwarmStore();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    image: '',
    replicas: 1,
    ports: '',
    env: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ports = formData.ports.split(',').map(p => p.trim()).filter(Boolean);
    const env = Object.fromEntries(
      formData.env.split(',')
        .map(e => e.trim())
        .filter(Boolean)
        .map(e => e.split('='))
    );

    addService({
      id: `svc-${Date.now()}`,
      name: formData.name,
      image: formData.image,
      replicas: formData.replicas,
      status: 'running',
      ports,
      env,
    });

    setFormData({
      name: '',
      image: '',
      replicas: 1,
      ports: '',
      env: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Service Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Docker Image
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Replicas
        </label>
        <input
          type="number"
          min="1"
          value={formData.replicas}
          onChange={(e) => setFormData({ ...formData, replicas: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Ports (comma-separated, e.g., "80:80,443:443")
        </label>
        <input
          type="text"
          value={formData.ports}
          onChange={(e) => setFormData({ ...formData, ports: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Environment Variables (comma-separated, e.g., "KEY=value,ANOTHER=value")
        </label>
        <input
          type="text"
          value={formData.env}
          onChange={(e) => setFormData({ ...formData, env: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Deploy Service
        </button>
      </div>
    </form>
  );
}