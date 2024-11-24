import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useMemoryStore } from '../../store/memoryStore';
import { useSheafStore } from '../../store/sheafStore';
import { SheafNode } from './SheafNode';
import { SheafConnection } from './SheafConnection';

export const HeightIndexedGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodes = useMemoryStore(state => state.nodes);
  const sheafNodes = useSheafStore(state => state.sheafNodes);
  const currentInstance = useSheafStore(state => state.currentInstance);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create container for zoom
    const container = svg.append('g');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink().id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('y', d3.forceY().strength((d: any) => {
        // Nodes at the same height should align horizontally
        return 0.1 * Math.abs(d.instance.height - currentInstance.height);
      }));

    // Update positions on simulation tick
    simulation.on('tick', () => {
      // Update node and connection positions
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, sheafNodes, currentInstance]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-gray-900"
      style={{ minHeight: '600px' }}
    >
      {!nodes.length && (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          fill="#6B7280"
          className="text-lg"
        >
          Add nodes using the control panel
        </text>
      )}
    </svg>
  );
};