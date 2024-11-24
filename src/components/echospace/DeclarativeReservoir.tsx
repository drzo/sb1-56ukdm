import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataNode {
  name: string;
  value?: number;
  children?: DataNode[];
}

interface HierarchyNode extends d3.HierarchyNode<DataNode> {
  r: number;
  x: number;
  y: number;
}

export default function DeclarativeReservoir() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    // Create hierarchical structure
    const data: DataNode = {
      name: "Knowledge",
      children: [
        {
          name: "Episodic",
          children: d3.range(5).map(i => ({
            name: `Memory ${i}`,
            value: Math.random() * 100
          }))
        },
        {
          name: "Semantic",
          children: d3.range(5).map(i => ({
            name: `Concept ${i}`,
            value: Math.random() * 100
          }))
        }
      ]
    };

    const root = d3.hierarchy<DataNode>(data)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const pack = d3.pack<DataNode>()
      .size([width - 40, height - 40])
      .padding(3);

    const nodes = pack(root) as unknown as HierarchyNode;

    // Create container
    const g = svg.append('g')
      .attr('transform', `translate(20,20)`);

    // Add circles
    const node = g.selectAll<SVGGElement, HierarchyNode>('g')
      .data(nodes.descendants())
      .join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    node.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.children 
        ? 'none'
        : d.parent?.data.name === 'Episodic'
          ? '#3b82f6'
          : '#ef4444')
      .attr('stroke', d => d.children ? '#94a3b8' : 'none')
      .attr('stroke-width', d => d.children ? 2 : 0)
      .attr('opacity', d => d.children ? 1 : 0.7)
      .attr('class', 'transition-colors duration-300 hover:opacity-90');

    // Add labels
    node.filter(d => d.depth < 2)
      .append('text')
      .attr('dy', '0.3em')
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-medium fill-current dark:text-white')
      .text(d => d.data.name);

  }, []);

  return <svg ref={svgRef} className="w-full h-full" />;
}