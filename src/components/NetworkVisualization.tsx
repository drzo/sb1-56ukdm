import React, { useEffect, useRef, memo } from 'react';
import * as d3 from 'd3';
import type { Node, Link } from '../lib/types';
import { cn } from '../lib/utils';
import { NETWORK_CONFIG, COLORS } from '../lib/constants';

interface NetworkVisualizationProps {
  nodes: Node[];
  links: Link[];
  activeNodes?: number[];
}

const NetworkVisualization = memo(({ 
  nodes, 
  links, 
  activeNodes = []
}: NetworkVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = React.useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container)
      .selectAll('svg')
      .data([null])
      .join('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    // Clear previous content
    svg.selectAll('*').remove();

    // Add gradient definitions
    const defs = svg.append('defs');
    defs.append('radialGradient')
      .attr('id', 'activeGradient')
      .selectAll('stop')
      .data([
        { offset: '0%', color: COLORS.ACTIVE },
        { offset: '100%', color: COLORS.ACTIVE_FADE }
      ])
      .join('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(NETWORK_CONFIG.SIMULATION_STRENGTH))
      .force('center', d3.forceCenter())
      .force('collision', d3.forceCollide().radius(NETWORK_CONFIG.NODE_RADIUS));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        switch (d.type) {
          case 'input': return COLORS.INPUT;
          case 'output': return COLORS.OUTPUT;
          default: return COLORS.RESERVOIR;
        }
      })
      .attr('stroke-opacity', NETWORK_CONFIG.LINK_OPACITY)
      .attr('stroke-width', d => Math.sqrt(d.value) * 2);

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag(simulation));

    node.append('circle')
      .attr('r', NETWORK_CONFIG.NODE_RADIUS)
      .attr('fill', d => {
        switch (d.type) {
          case 'input': return COLORS.INPUT;
          case 'output': return COLORS.OUTPUT;
          default: return COLORS.RESERVOIR;
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    node.filter(d => activeNodes.includes(d.id))
      .append('circle')
      .attr('r', NETWORK_CONFIG.ACTIVE_NODE_RADIUS)
      .attr('fill', 'url(#activeGradient)');

    node
      .on('mouseover', (event, d: Node) => {
        setHoveredNode(d.id);
        d3.select(event.currentTarget)
          .select('circle')
          .transition()
          .duration(NETWORK_CONFIG.ANIMATION_DURATION)
          .attr('r', NETWORK_CONFIG.NODE_RADIUS + 2);
      })
      .on('mouseout', (event) => {
        setHoveredNode(null);
        d3.select(event.currentTarget)
          .select('circle')
          .transition()
          .duration(NETWORK_CONFIG.ANIMATION_DURATION)
          .attr('r', NETWORK_CONFIG.NODE_RADIUS);
      });

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [nodes, links, activeNodes]);

  return (
    <div className="relative w-full h-[400px] bg-white rounded-lg shadow-sm p-4">
      <div ref={containerRef} className="w-full h-full" />
      <Legend />
      {hoveredNode !== null && <NodeTooltip nodeId={hoveredNode} />}
    </div>
  );
});

const Legend = memo(() => (
  <div className="absolute top-4 left-4 text-sm text-gray-600 space-y-2">
    <div className="flex items-center space-x-2">
      <span className="w-3 h-3 rounded-full bg-indigo-500" />
      <span>Input nodes</span>
    </div>
    <div className="flex items-center space-x-2">
      <span className="w-3 h-3 rounded-full bg-gray-400" />
      <span>Reservoir nodes</span>
    </div>
    <div className="flex items-center space-x-2">
      <span className="w-3 h-3 rounded-full bg-emerald-500" />
      <span>Output nodes</span>
    </div>
  </div>
));

const NodeTooltip = memo(({ nodeId }: { nodeId: number }) => (
  <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm">
    Node {nodeId}
  </div>
));

function drag(simulation: d3.Simulation<any, undefined>) {
  return d3.drag<SVGGElement, Node>()
    .on('start', (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });
}

NetworkVisualization.displayName = 'NetworkVisualization';
Legend.displayName = 'Legend';
NodeTooltip.displayName = 'NodeTooltip';

export default NetworkVisualization;