import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Atom } from '../../../lib/types';

interface AtomGraphProps {
  atoms: Atom[];
  width?: number;
  height?: number;
  isDarkMode?: boolean;
}

export const AtomGraph: React.FC<AtomGraphProps> = ({
  atoms,
  width = 800,
  height = 600,
  isDarkMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(atoms)
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    const links = atoms.flatMap(atom => 
      (atom.outgoing || []).map(targetId => ({
        source: atom.id,
        target: targetId
      }))
    );

    const linkElements = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', isDarkMode ? '#4B5563' : '#9CA3AF')
      .attr('stroke-width', 1);

    const nodeElements = svg.append('g')
      .selectAll('circle')
      .data(atoms)
      .join('circle')
      .attr('r', 5)
      .attr('fill', d => getNodeColor(d.type))
      .call(drag(simulation));

    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      nodeElements
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [atoms, width, height, isDarkMode]);

  return (
    <svg 
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
};

const getNodeColor = (type: string): string => {
  switch (type) {
    case 'ConceptNode':
      return '#3B82F6';
    case 'PredicateNode':
      return '#10B981';
    case 'ListLink':
      return '#F59E0B';
    case 'EvaluationLink':
      return '#8B5CF6';
    default:
      return '#6B7280';
  }
};

const drag = (simulation: d3.Simulation<any, undefined>) => {
  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
};