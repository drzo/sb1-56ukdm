import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SystemData } from '../../data/systems';
import { createForceLayout } from './layout/forceLayout';
import { createGroupHulls } from './layout/groupHulls';
import { setupInteractions } from './interactions';
import { renderNodes, renderLinks, renderLabels } from './renderers';

interface SystemGraphProps {
  data: SystemData;
  isDarkMode: boolean;
  width?: number;
  height?: number;
}

export const SystemGraph: React.FC<SystemGraphProps> = ({
  data,
  isDarkMode,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create container for zoomable content
    const container = svg.append('g');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create group hulls first (background)
    const hulls = createGroupHulls(container, data.groups, isDarkMode);

    // Create force simulation
    const simulation = createForceLayout(data, width, height);

    // Create links
    const links = renderLinks(container, data.links, isDarkMode);

    // Create nodes with labels and interactions
    const nodes = renderNodes(container, data.nodes, simulation, isDarkMode);
    renderLabels(nodes, isDarkMode);

    // Setup node dragging and other interactions
    setupInteractions(nodes, simulation, zoom, svg);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      // Update link positions
      links
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      // Update node positions
      nodes.attr('transform', d => `translate(${d.x},${d.y})`);

      // Update hull positions
      hulls.each(function(d) {
        const points = data.nodes
          .filter(n => n.group === d.id)
          .map(n => [n.x || 0, n.y || 0]);
        
        const hull = d3.polygonHull(points);
        if (hull) {
          d3.select(this)
            .attr('d', `M${hull.join('L')}Z`);
        }
      });
    });

    // Initial zoom transform
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(0.8)
      .translate(-width / 2, -height / 2);
    
    svg.call(zoom.transform, initialTransform);

    // Double-click to reset zoom
    svg.on('dblclick.zoom', () => {
      svg.transition()
        .duration(750)
        .call(zoom.transform, initialTransform);
    });

    return () => {
      simulation.stop();
    };
  }, [data, isDarkMode, width, height]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height} 
      className={`w-full border rounded-lg transition-colors duration-200 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    />
  );
};