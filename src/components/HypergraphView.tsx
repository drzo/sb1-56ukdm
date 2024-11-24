import React from 'react';
import { useStore } from '../store';
import { HypergraphData } from '../types';

const mockHypergraph: HypergraphData = {
  nodes: [
    { id: 'n1', type: 'concept', label: 'Concept A' },
    { id: 'n2', type: 'concept', label: 'Concept B' },
    { id: 'n3', type: 'concept', label: 'Concept C' },
    { id: 'n4', type: 'relation', label: 'Relation X' }
  ],
  hyperedges: [
    {
      id: 'h1',
      nodes: ['n1', 'n2', 'n4'],
      type: 'semantic'
    },
    {
      id: 'h2',
      nodes: ['n2', 'n3'],
      type: 'causal'
    }
  ]
};

export default function HypergraphView() {
  return (
    <div className="h-full bg-white overflow-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Hypergraph Structure</h2>
        
        <div className="grid gap-6">
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Nodes</h3>
            <div className="grid gap-3">
              {mockHypergraph.nodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                >
                  <div>
                    <span className="font-medium">{node.label}</span>
                    <span className="ml-2 text-sm text-gray-500">({node.type})</span>
                  </div>
                  <span className="text-sm text-gray-400">{node.id}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Hyperedges</h3>
            <div className="grid gap-3">
              {mockHypergraph.hyperedges.map((edge) => (
                <div
                  key={edge.id}
                  className="p-3 bg-white rounded border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{edge.id}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {edge.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {edge.nodes.map((nodeId) => (
                      <span
                        key={nodeId}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {nodeId}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}