import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Atom } from '../../../../lib/types';
import { Node, Link, GraphLayout } from './types';
import { useGraphLayout } from './hooks/useGraphLayout';
import { useGraphInteractions } from './hooks/useGraphInteractions';
import { useGraphStyles } from './hooks/useGraphStyles';

interface AtomGraphRendererProps {
  atoms: Atom[];
  width?: number;
  height?: number;
  layout?: GraphLayout;
  showLabels?: boolean;
}

export const AtomGraphRenderer: React.FC<AtomGraphRendererProps> = ({
  atoms,
  width = 800,
  height = 600,
  layout = 'force',
  showLabels = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { createForceLayout, createTreeLayout, createRadialLayout } = useGraphLayout(width, height);
  const { setupDragBehavior } = useGraphInteractions();
  const { getNodeColor, getLinkStyle } = useGraphStyles();

  useEffect(() => {
    if (!svgRef.current) return;

    const nodes: Node[] = atoms.map(atom => ({
      id: atom.id,
      name: atom.name,
      type: atom.type
    }));

    const links: Link[] = atoms.flatMap(atom => 
      atom.outgoing?.map(targetId => ({
        source: atom.id,
        target: targetId
      })) || []
    );

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    let simulation: d3.Simulation<Node, Link>;

    switch (layout) {
      case 'tree':
        const treeLayout = createTreeLayout(nodes, links);
        // Apply tree layout
        break;
      case 'radial':
        const radialLayout = createRadialLayout(nodes, links);
        // Apply radial layout
        break;
      default:
        simulation = createForceLayout(nodes, links);
        
        const link = svg.append('g')
          .selectAll('line')
          .data(links)
          .join('line')
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.6);

        const node = svg.append('g')
          .selectAll('g')
          .data(nodes)
          .join('g')
          .call(setupDragBehavior(simulation));

        node.append('circle')
          .attr('r', 5)
          .attr('fill', d => getNodeColor(d.type));

        if (showLabels) {
          node.append('text')
            .attr('x', 8)
            .attr('y', 4)
            .text(d => d.name)
            .attr('font-size', '10px');
        }

        simulation.on('tick', () => {
          link
            .attr('x1', d => (d.source as any).x)
            .attr('y1', d => (d.source as any).y)
            .attr('x2', d => (d.target as any).x)
            .attr('y2', d => (d.target as any).y);

          node
            .attr('transform', d => `translate(${d.x},${d.y})`);
        });
    }

    return () => {
      if (simulation) simulation.stop();
    };
  }, [atoms, width, height, layout, showLabels]);

  return <svg ref={svgRef} />;
};