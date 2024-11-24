import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useAtomSpace } from '../../store/atomSpaceStore';
import { Atom } from '../../types/atom';
import { MEMORY_TYPES_CONFIG } from '../../constants/memoryTypes';

interface HeightIndexedLayoutProps {
  width: number;
  height: number;
}

export const HeightIndexedLayout: React.FC<HeightIndexedLayoutProps> = ({
  width,
  height
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const atoms = useAtomSpace(state => Array.from(state.atoms.values()));
  const heightIndices = useAtomSpace(state => state.heightIndices);

  useEffect(() => {
    if (!svgRef.current || !atoms.length) return;

    const svg = d3.select(svgRef.current);
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

    // Calculate layout
    const heightLevels = Array.from(heightIndices.keys()).sort();
    const levelHeight = height / (heightLevels.length + 1);

    // Create force simulation
    const simulation = d3.forceSimulation(atoms)
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('y', d3.forceY().strength(0.3).y((d: any) => {
        const level = heightLevels.indexOf(d.height || 0);
        return (level + 1) * levelHeight;
      }))
      .force('collision', d3.forceCollide().radius(30));

    // Create links
    const links = atoms.flatMap(atom => 
      (atom.outgoing || []).map(targetId => ({
        source: atom.id,
        target: targetId
      }))
    );

    const linkElements = container
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#4B5563')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.6);

    // Create nodes
    const nodeGroups = container
      .append('g')
      .selectAll('g')
      .data(atoms)
      .join('g')
      .attr('cursor', 'pointer');

    // Add circles for nodes
    nodeGroups
      .append('circle')
      .attr('r', 20)
      .attr('fill', (d: Atom) => {
        const type = d.type.toLowerCase();
        return MEMORY_TYPES_CONFIG[type as keyof typeof MEMORY_TYPES_CONFIG]?.color || '#6B7280';
      });

    // Add height labels
    nodeGroups
      .append('text')
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9CA3AF')
      .text((d: Atom) => `h=${d.height || 0}`);

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
  }, [atoms, heightIndices, width, height]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-gray-900"
      width={width}
      height={height}
    />
  );
};