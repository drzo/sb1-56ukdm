import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useInstanceStore } from '../../store/instanceStore';
import { NetworkMessage } from '../../types/instance';
import { INSTANCE_TYPES } from '../../constants/instanceTypes';

interface NetworkNode {
  id: string;
  type: string;
  platform: string;
  height: number;
  status: string;
}

interface NetworkLink {
  source: string;
  target: string;
  messages: NetworkMessage[];
}

export const NetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const instances = useInstanceStore(state => Array.from(state.instances.values()));
  const messages = useInstanceStore(state => state.messages);
  const instanceStates = useInstanceStore(state => state.instanceStates);

  useEffect(() => {
    if (!svgRef.current || !instances.length) return;

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

    // Prepare data
    const nodes: NetworkNode[] = instances.map(instance => ({
      id: instance.id,
      type: instance.type,
      platform: instance.platform,
      height: instance.height,
      status: instanceStates.get(instance.id)?.status || 'idle'
    }));

    // Create links based on message flow
    const links: NetworkLink[] = [];
    messages.forEach(msg => {
      const existingLink = links.find(
        link => link.source === msg.instanceId || link.target === msg.instanceId
      );

      if (existingLink) {
        existingLink.messages.push(msg);
      } else {
        links.push({
          source: msg.instanceId,
          target: instances.find(i => i.id !== msg.instanceId)?.id || msg.instanceId,
          messages: [msg]
        });
      }
    });

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create links
    const linkElements = container
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#4B5563')
      .attr('stroke-width', d => Math.min(1 + d.messages.length * 0.5, 4))
      .attr('stroke-opacity', 0.6);

    // Create node groups
    const nodeGroups = container
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer');

    // Add circles for nodes
    nodeGroups
      .append('circle')
      .attr('r', 25)
      .attr('fill', d => {
        const config = INSTANCE_TYPES.find(t => t.type === d.type);
        return config?.color.replace('bg-', '') || '#6B7280';
      })
      .attr('stroke', d => d.status === 'active' ? '#10B981' : 'none')
      .attr('stroke-width', 3);

    // Add instance type labels
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 35)
      .attr('fill', '#9CA3AF')
      .text(d => INSTANCE_TYPES.find(t => t.type === d.type)?.label || d.type);

    // Add height indicators
    nodeGroups
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -35)
      .attr('fill', '#9CA3AF')
      .text(d => `h=${d.height}`);

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
  }, [instances, messages, instanceStates]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};