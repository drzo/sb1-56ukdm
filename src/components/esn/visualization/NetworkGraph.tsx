import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { ESNState } from '@/reservoir/types/ESNTypes';
import { useNetworkLayout } from '@/reservoir/hooks/useNetworkLayout';
import { Logger } from '@/cogutil/Logger';

interface NetworkGraphProps {
  state: ESNState;
  width?: number;
  height?: number;
  onNodeClick?: (nodeId: number) => void;
}

export function NetworkGraph({ 
  state, 
  width = 600, 
  height = 400,
  onNodeClick 
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { layout, updateLayout } = useNetworkLayout();

  const nodes = useMemo(() => createNodes(state), [state]);
  const links = useMemo(() => createLinks(state), [state]);

  useEffect(() => {
    if (!svgRef.current) return;

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      // Create container group with zoom support
      const g = svg.append('g');
      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => g.attr('transform', event.transform));
      svg.call(zoom);

      // Update layout
      updateLayout(nodes, links);

      // Create link elements
      const linkElements = g.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'network-link')
        .attr('stroke', d => d3.interpolateRdBu(d.weight))
        .attr('stroke-width', d => Math.abs(d.weight) * 2)
        .attr('opacity', 0.6);

      // Create node elements
      const nodeElements = g.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('class', 'network-node')
        .attr('r', 5)
        .attr('fill', d => d.type === 'input' ? '#4CAF50' : '#2196F3')
        .call(d3.drag()
          .on('start', dragStarted)
          .on('drag', dragging)
          .on('end', dragEnded)
        )
        .on('click', (event, d) => onNodeClick?.(d.id));

      // Add tooltips
      const tooltip = d3.select(svgRef.current.parentElement)
        .append('div')
        .attr('class', 'absolute hidden bg-black/75 text-white p-2 rounded text-sm')
        .style('pointer-events', 'none');

      nodeElements
        .on('mouseover', (event, d) => {
          tooltip
            .style('display', 'block')
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(`Node ${d.id}<br>Type: ${d.type}<br>Value: ${d.value.toFixed(3)}`);
        })
        .on('mouseout', () => {
          tooltip.style('display', 'none');
        });

      // Update positions on layout tick
      layout.on('tick', () => {
        linkElements
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodeElements
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });

      function dragStarted(event: any) {
        if (!event.active) layout.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragging(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragEnded(event: any) {
        if (!event.active) layout.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      Logger.debug('Network graph rendered');
    } catch (error) {
      Logger.error('Failed to render network graph:', error);
    }
  }, [state, width, height, nodes, links, onNodeClick]);

  return (
    <div className="relative">
      <svg 
        ref={svgRef}
        width={width}
        height={height}
        className="bg-card rounded-lg"
        viewBox={`0 0 ${width} ${height}`}
      />
    </div>
  );
}

function createNodes(state: ESNState) {
  const nodes = [];

  // Input nodes
  for (let i = 0; i < state.weights.input[0].length; i++) {
    nodes.push({
      id: i,
      type: 'input',
      value: 0,
      x: undefined,
      y: undefined
    });
  }

  // Reservoir nodes
  for (let i = 0; i < state.weights.reservoir.length; i++) {
    nodes.push({
      id: i + state.weights.input[0].length,
      type: 'reservoir',
      value: state.state[i],
      x: undefined,
      y: undefined
    });
  }

  return nodes;
}

function createLinks(state: ESNState) {
  const links = [];
  const inputSize = state.weights.input[0].length;

  // Input connections
  for (let i = 0; i < state.weights.input.length; i++) {
    for (let j = 0; j < state.weights.input[i].length; j++) {
      if (Math.abs(state.weights.input[i][j]) > 0.01) {
        links.push({
          source: j,
          target: i + inputSize,
          weight: state.weights.input[i][j]
        });
      }
    }
  }

  // Reservoir connections
  for (let i = 0; i < state.weights.reservoir.length; i++) {
    for (let j = 0; j < state.weights.reservoir[i].length; j++) {
      if (Math.abs(state.weights.reservoir[i][j]) > 0.01) {
        links.push({
          source: i + inputSize,
          target: j + inputSize,
          weight: state.weights.reservoir[i][j]
        });
      }
    }
  }

  return links;
}