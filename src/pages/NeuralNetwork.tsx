import React from 'react';
import Header from '../components/Header';
import { Activity, Cpu, Zap } from 'lucide-react';
import NetworkGraph from '../components/NetworkGraph';

interface NeuralNetworkProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export default function NeuralNetwork({ isDark, setIsDark }: NeuralNetworkProps) {
  return (
    <main className="flex-1 flex flex-col">
      <Header title="Neural Network" isDark={isDark} setIsDark={setIsDark} />
      
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Network Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Active Nodes</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">1,245</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Connections</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">5,678</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Response Time</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">24ms</span>
              </div>
            </div>
          </div>

          {/* Processing Units */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Processing Units</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">CPU Usage</span>
                  <span className="text-sm text-gray-900 dark:text-white">78%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Memory Usage</span>
                  <span className="text-sm text-gray-900 dark:text-white">64%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Accuracy</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Error Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">0.015</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Training Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">89%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Visualization */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Network Visualization</h3>
          <div className="h-[600px]">
            <NetworkGraph isDark={isDark} />
          </div>
        </div>
      </div>
    </main>
  );
}