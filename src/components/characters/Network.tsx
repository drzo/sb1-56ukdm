import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useCharacterNetwork } from '../../hooks/useCharacterNetwork';
import type { NetworkNode, NetworkLink } from '../../types';

interface CharacterNetworkProps {
  onSelect?: (character: NetworkNode) => void;
}

export default function CharacterNetwork({ onSelect }: CharacterNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data } = useCharacterNetwork();

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation<NetworkNode>(data.nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(data.links)
        .id(d => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const links = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value));

    const nodes = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', 10)
      .attr('fill', d => d3.schemeCategory10[d.group])
      .on('click', (_, d) => onSelect?.(d))
      .call(drag(simulation));

    simulation.on('tick', () => {
      links
        .attr('x1', d => (d.source as NetworkNode).x!)
        .attr('y1', d => (d.source as NetworkNode).y!)
        .attr('x2', d => (d.target as NetworkNode).x!)
        .attr('y2', d => (d.target as NetworkNode).y!);

      nodes
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);
    });

    function drag(simulation: d3.Simulation<NetworkNode, undefined>) {
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

      return d3.drag<SVGCircleElement, NetworkNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, [data, onSelect]);

  return (
    <svg 
      ref={svgRef} 
      className="w-full h-full"
    />
  );
}