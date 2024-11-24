import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: number;
  state: number;
  type: 'input' | 'reservoir' | 'output';
  x?: number;
  y?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
}

export default function EchoStateNetwork() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    // Create ESN visualization
    const nodes: Node[] = d3.range(50).map(i => ({
      id: i,
      state: Math.random(),
      type: i < 10 ? 'input' : i >= 40 ? 'output' : 'reservoir'
    }));

    const links: Link[] = [];
    nodes.forEach((sourceNode, i) => {
      nodes.forEach((targetNode, j) => {
        if (Math.random() < 0.1) {
          links.push({ 
            source: sourceNode, 
            target: targetNode 
          });
        }
      });
    });

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).distance(30))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll<SVGLineElement, Link>('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1);

    const node = svg.append('g')
      .selectAll<SVGCircleElement, Node>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', d => d.type === 'input' ? '#22c55e' : 
                        d.type === 'output' ? '#ef4444' : '#3b82f6');

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x!)
        .attr('y1', d => d.source.y!)
        .attr('x2', d => d.target.x!)
        .attr('y2', d => d.target.y!);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, []);

  return <svg ref={svgRef} className="w-full h-full" />;
}