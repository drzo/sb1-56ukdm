import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Pattern } from '../../types/patterns';

interface PatternHierarchyProps {
  data: Pattern[];
  onSelect: (pattern: Pattern) => void;
  searchQuery: string;
}

interface ForceNode extends d3.SimulationNodeDatum {
  id: number;
  name: string;
  pattern: Pattern;
  level: number;
}

interface ForceLink extends d3.SimulationLinkDatum<ForceNode> {
  source: ForceNode;
  target: ForceNode;
  type: 'broader' | 'narrower';
}

type LayoutStyle = 'hierarchical' | 'radial' | 'force' | 'clustered';

export default function PatternHierarchy({ 
  data, 
  onSelect,
  searchQuery 
}: PatternHierarchyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('hierarchical');

  // Create force simulation based on layout style
  const createForceSimulation = (
    nodes: ForceNode[], 
    links: ForceLink[], 
    width: number, 
    height: number
  ) => {
    const simulation = d3.forceSimulation<ForceNode>(nodes);

    switch (layoutStyle) {
      case 'hierarchical':
        return simulation
          .force('link', d3.forceLink<ForceNode, ForceLink>(links)
            .id(d => d.id)
            .distance(120))
          .force('charge', d3.forceManyBody()
            .strength(d => -800 - d.level * 100)
            .distanceMax(500))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('y', d3.forceY()
            .strength(0.3)
            .y(d => height * (0.2 + d.level * 0.15)))
          .force('collision', d3.forceCollide().radius(30).strength(0.8));

      case 'radial':
        return simulation
          .force('link', d3.forceLink<ForceNode, ForceLink>(links)
            .id(d => d.id)
            .distance(100))
          .force('charge', d3.forceManyBody().strength(-500))
          .force('r', d3.forceRadial(
            d => 100 + d.level * 100,
            width / 2,
            height / 2
          ).strength(0.8))
          .force('collision', d3.forceCollide().radius(30).strength(0.8));

      case 'force':
        return simulation
          .force('link', d3.forceLink<ForceNode, ForceLink>(links)
            .id(d => d.id)
            .distance(100))
          .force('charge', d3.forceManyBody()
            .strength(-1000)
            .distanceMax(500))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide().radius(30).strength(1));

      case 'clustered':
        const groupCenters = new Map<number, { x: number, y: number }>();
        const numGroups = Math.max(...nodes.map(n => n.level)) + 1;
        
        for (let i = 0; i < numGroups; i++) {
          const angle = (2 * Math.PI * i) / numGroups;
          groupCenters.set(i, {
            x: width/2 + Math.cos(angle) * 200,
            y: height/2 + Math.sin(angle) * 200
          });
        }

        return simulation
          .force('link', d3.forceLink<ForceNode, ForceLink>(links)
            .id(d => d.id)
            .distance(80))
          .force('charge', d3.forceManyBody().strength(-300))
          .force('cluster', alpha => {
            for (const node of nodes) {
              const center = groupCenters.get(node.level);
              if (center) {
                node.vx = (node.vx || 0) + (center.x - (node.x || 0)) * alpha * 0.1;
                node.vy = (node.vy || 0) + (center.y - (node.y || 0)) * alpha * 0.1;
              }
            }
          })
          .force('collision', d3.forceCollide().radius(30).strength(0.8));
    }
  };

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    // Process data into nodes and links
    const nodes: ForceNode[] = [];
    const links: ForceLink[] = [];
    const nodeMap = new Map<number, ForceNode>();

    // First pass: create nodes
    data.forEach(pattern => {
      const node: ForceNode = {
        id: pattern.id,
        name: pattern.name,
        pattern,
        level: pattern.broaderPatterns.length
      };
      nodes.push(node);
      nodeMap.set(pattern.id, node);
    });

    // Second pass: create links
    data.forEach(pattern => {
      pattern.broaderPatterns.forEach(broaderId => {
        const source = nodeMap.get(broaderId);
        const target = nodeMap.get(pattern.id);
        if (source && target) {
          links.push({ source, target, type: 'broader' });
        }
      });

      pattern.narrowerPatterns.forEach(narrowerId => {
        const source = nodeMap.get(pattern.id);
        const target = nodeMap.get(narrowerId);
        if (source && target) {
          links.push({ source, target, type: 'narrower' });
        }
      });
    });

    // Create force simulation
    const simulation = createForceSimulation(nodes, links, width, height);

    // Create container for zoom
    const g = svg.append('g');

    // Add zoom behavior
    svg.call(d3.zoom<SVGSVGElement, unknown>()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));

    // Create arrow markers
    svg.append('defs').selectAll('marker')
      .data(['broader', 'narrower'])
      .join('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', d => d === 'broader' ? '#3b82f6' : '#94a3b8')
      .attr('d', 'M0,-5L10,0L0,5');

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.type === 'broader' ? '#3b82f6' : '#94a3b8')
      .attr('stroke-width', d => d.type === 'broader' ? 2 : 1)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, ForceNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', 8)
      .attr('fill', d => {
        if (searchQuery && d.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return '#3b82f6';
        }
        return d3.interpolateBlues(0.3 + (d.level * 0.2));
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('class', 'transition-colors duration-300 hover:fill-blue-400')
      .on('click', (_, d) => onSelect(d.pattern));

    // Add labels with semi-transparent dark background
    const label = node.append('g')
      .attr('class', 'label');

    label.append('text')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .attr('class', 'text-sm fill-current dark:text-white')
      .text(d => `${d.id}. ${d.name}`)
      .each(function() {
        const bbox = this.getBBox();
        const padding = 4;
        
        d3.select(this.parentNode)
          .insert('rect', 'text')
          .attr('x', bbox.x - padding)
          .attr('y', bbox.y - padding)
          .attr('width', bbox.width + 2 * padding)
          .attr('height', bbox.height + 2 * padding)
          .attr('fill', 'rgba(0, 0, 0, 0.6)')
          .attr('rx', 4);
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x!)
        .attr('y1', d => d.source.y!)
        .attr('x2', d => d.target.x!)
        .attr('y2', d => d.target.y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, ForceNode, ForceNode>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, onSelect, searchQuery, layoutStyle]);

  return (
    <div className="relative h-full">
      <div className="absolute top-4 right-4 z-10">
        <select
          value={layoutStyle}
          onChange={(e) => setLayoutStyle(e.target.value as LayoutStyle)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="hierarchical">Hierarchical</option>
          <option value="radial">Radial</option>
          <option value="force">Force</option>
          <option value="clustered">Clustered</option>
        </select>
      </div>
      <svg 
        ref={svgRef} 
        className="w-full h-full"
      />
    </div>
  );
}