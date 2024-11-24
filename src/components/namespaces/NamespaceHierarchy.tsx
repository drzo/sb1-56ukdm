import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Namespace, NamespaceNode, NamespaceLink } from '../../types/namespaces';

interface NamespaceHierarchyProps {
  data: Namespace[];
  onSelect: (namespace: Namespace) => void;
  searchQuery: string;
}

type LayoutStyle = 'tree' | 'radial' | 'force';

export default function NamespaceHierarchy({
  data,
  onSelect,
  searchQuery
}: NamespaceHierarchyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('tree');

  useEffect(() => {
    if (!data?.[0] || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    svg.selectAll('*').remove();

    // Process data into nodes and links
    const nodes: NamespaceNode[] = [];
    const links: NamespaceLink[] = [];
    const nodeMap = new Map<string, NamespaceNode>();

    function processNode(ns: Namespace, level: number) {
      const node: NamespaceNode = {
        id: ns.path,
        name: ns.name,
        type: ns.type,
        path: ns.path,
        level
      };
      nodes.push(node);
      nodeMap.set(ns.path, node);

      if (ns.mountPoint && !nodeMap.has(ns.mountPoint)) {
        const mountNode: NamespaceNode = {
          id: ns.mountPoint,
          name: ns.mountPoint.split('/').pop() || '',
          type: 'mount',
          path: ns.mountPoint,
          level: level + 1
        };
        nodes.push(mountNode);
        nodeMap.set(ns.mountPoint, mountNode);
      }

      ns.children?.forEach(child => processNode(child, level + 1));
    }

    function createLinks(ns: Namespace) {
      const source = nodeMap.get(ns.path);
      if (!source) return;

      ns.children?.forEach(child => {
        const target = nodeMap.get(child.path);
        if (target) {
          links.push({
            source: source.id,
            target: target.id,
            type: 'child'
          });
        }
        createLinks(child);
      });

      if (ns.mountPoint) {
        const mount = nodeMap.get(ns.mountPoint);
        if (mount) {
          links.push({
            source: source.id,
            target: mount.id,
            type: 'mount'
          });
        }
      }
    }

    // Start with the root node
    processNode(data[0], 0);
    createLinks(data[0]);

    // Create layout based on selected style
    let simulation: d3.Simulation<NamespaceNode, NamespaceLink>;

    switch (layoutStyle) {
      case 'tree': {
        const treeLayout = d3.tree<NamespaceNode>()
          .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
          .nodeSize([50, 100]);

        const root = d3.stratify<NamespaceNode>()
          .id(d => d.id)
          .parentId(d => {
            if (d.id === '/') return null;
            const parentPath = d.path.split('/').slice(0, -1).join('/') || '/';
            return parentPath;
          })(nodes);

        const treeData = treeLayout(root);

        // Position nodes
        treeData.each(d => {
          const node = nodeMap.get(d.id);
          if (node) {
            node.x = d.x + margin.left;
            node.y = d.y + margin.top;
          }
        });

        simulation = d3.forceSimulation<NamespaceNode>(nodes)
          .force('x', d3.forceX<NamespaceNode>(d => d.x!).strength(1))
          .force('y', d3.forceY<NamespaceNode>(d => d.y!).strength(1));
        break;
      }

      case 'radial': {
        const radius = Math.min(width, height) / 2 - margin.top;
        
        simulation = d3.forceSimulation<NamespaceNode>(nodes)
          .force('link', d3.forceLink<NamespaceNode, NamespaceLink>(links)
            .id(d => d.id)
            .distance(100))
          .force('charge', d3.forceManyBody().strength(-500))
          .force('r', d3.forceRadial(
            d => radius * (0.3 + d.level * 0.2),
            width / 2,
            height / 2
          ));
        break;
      }

      case 'force':
      default: {
        simulation = d3.forceSimulation<NamespaceNode>(nodes)
          .force('link', d3.forceLink<NamespaceNode, NamespaceLink>(links)
            .id(d => d.id)
            .distance(100))
          .force('charge', d3.forceManyBody().strength(-500))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide().radius(30));
        break;
      }
    }

    // Create container for zoom
    const g = svg.append('g');

    // Add zoom behavior
    svg.call(d3.zoom<SVGSVGElement, unknown>()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.type === 'child' ? '#3b82f6' : '#ef4444')
      .attr('stroke-width', d => d.type === 'child' ? 1 : 2)
      .attr('stroke-dasharray', d => d.type === 'mount' ? '5,5' : null);

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .on('click', (_, d) => {
        const ns = data[0];
        let target = ns;
        const parts = d.path.split('/').filter(Boolean);
        for (const part of parts) {
          target = target.children?.find(c => c.name === part) || target;
        }
        if (target) onSelect(target);
      });

    // Add shapes based on node type
    node.each(function(d) {
      const shape = d3.select(this);
      const size = 12;

      switch (d.type) {
        case 'directory':
          shape.append('rect')
            .attr('x', -size/2)
            .attr('y', -size/2)
            .attr('width', size)
            .attr('height', size)
            .attr('fill', '#3b82f6');
          break;
        case 'file':
          shape.append('circle')
            .attr('r', size/2)
            .attr('fill', '#10b981');
          break;
        case 'mount':
          shape.append('polygon')
            .attr('points', `0,${-size/2} ${size/2},${size/2} ${-size/2},${size/2}`)
            .attr('fill', '#ef4444');
          break;
      }
    });

    // Add labels with dark background
    const label = node.append('g')
      .attr('class', 'label');

    label.append('text')
      .attr('dx', 15)
      .attr('dy', '.35em')
      .attr('class', 'text-sm fill-current dark:text-white')
      .text(d => d.name)
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
        .attr('x1', d => (d.source as NamespaceNode).x!)
        .attr('y1', d => (d.source as NamespaceNode).y!)
        .attr('x2', d => (d.target as NamespaceNode).x!)
        .attr('y2', d => (d.target as NamespaceNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

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
          <option value="tree">Tree</option>
          <option value="radial">Radial</option>
          <option value="force">Force</option>
        </select>
      </div>
      <svg 
        ref={svgRef} 
        className="w-full h-full"
      />
    </div>
  );
}