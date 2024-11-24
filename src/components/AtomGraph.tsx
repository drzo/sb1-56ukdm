import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Atom } from '../lib/types';
import { useAtomSpace } from '../lib/atomspace';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
}

export const AtomGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const atomSpace = useAtomSpace();

  useEffect(() => {
    if (!svgRef.current) return;

    const atoms = Array.from(atomSpace.atoms.values());
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

    const width = 800;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6);

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', d => d.type === 'ConceptNode' ? '#ff7f0e' : '#1f77b4');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [atomSpace.atoms]);

  return <svg ref={svgRef} />;
};