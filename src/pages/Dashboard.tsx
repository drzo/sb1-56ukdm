import React from 'react';
import { NetworkGraph } from '../components/NetworkGraph';
import { StorageMetrics } from '../components/StorageMetrics';
import { PerformanceMetrics } from '../components/PerformanceMetrics';
import { NodeList } from '../components/swarm/NodeList';
import { ServiceList } from '../components/swarm/ServiceList';
import { DeploymentForm } from '../components/swarm/DeploymentForm';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Swarm Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Network Topology</h2>
            <NetworkGraph />
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Storage Distribution</h2>
            <StorageMetrics />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h2>
            <PerformanceMetrics />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Nodes</h2>
            <NodeList />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Services</h2>
            <ServiceList />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Deploy New Service</h2>
            <DeploymentForm />
          </div>
        </div>
      </div>
    </div>
  );
}