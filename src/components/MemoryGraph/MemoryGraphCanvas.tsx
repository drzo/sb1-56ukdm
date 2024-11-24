import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useMemoryStore } from '../../store/memoryStore';
import { MEMORY_TYPES_CONFIG } from '../../constants/memoryTypes';
import { NodeGroup } from './components/NodeGroup';
import { Links } from './components/Links';

export const MemoryGraphCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodes = useMemoryStore((state) => state.nodes);
  const selectedNode = useMemoryStore((state) => state.selectedNode);
  const selectNode = useMemoryStore((state) => state.selectNode);
  const connectionMode = useMemoryStore((state) => state.connectionMode);
  const completeConnection = useMemoryStore((state) => state.completeConnection);
  const cancelConnection = useMemoryStore((state) => state.cancelConnection);
  const currentInstance = useMemoryStore((state) => state.currentInstance);

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

    // Create links from connections
    const links = nodes.flatMap(node =>
      node.connections.map(conn => ({
        source: node.id,
        target: conn.targetId,
        type: conn.type,
        sourceHeight: conn.sourceHeight,
        targetHeight: conn.targetHeight
      }))
    );

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('y', d3.forceY().strength((d: any) => {
        // Nodes at the same height should align horizontally
        return 0.1 * Math.abs(d.instance.height - currentInstance.height);
      }));

    // Create links group
    const linksGroup = container.append('g').attr('class', 'links');
    const linkElements = linksGroup.selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#4B5563')
      .attr('stroke-width', 2);

    // Create nodes group
    const nodesGroup = container.append('g').attr('class', 'nodes');
    const nodeGroups = nodesGroup.selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', d => `node ${d.id === connectionMode.sourceId ? 'source-node' : ''}`)
      .style('cursor', d => {
        if (connectionMode.active) {
          return d.id === connectionMode.sourceId ? 'not-allowed' : 'crosshair';
        }
        return 'pointer';
      });

    // Add node interactions
    nodeGroups
      .on('click', (event, d: any) => {
        event.stopPropagation();
        if (connectionMode.active) {
          if (d.id !== connectionMode.sourceId) {
            completeConnection(d.id);
          }
        } else {
          selectNode(d.id);
        }
      });

    // Add background click handler
    svg.on('click', (event) => {
      if (event.target === svgRef.current && connectionMode.active) {
        cancelConnection();
      }
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroups.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, selectedNode, connectionMode, currentInstance]);

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