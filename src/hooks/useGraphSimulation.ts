import { useCallback, useRef } from 'react';
import * as d3 from 'd3';
import { MemoryNode, NodePosition } from '../types/memory';

interface UseGraphSimulationProps {
  nodes: MemoryNode[];
  onTick: (positions: Record<string, NodePosition>) => void;
}

export const useGraphSimulation = ({ nodes, onTick }: UseGraphSimulationProps) => {
  const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null);

  const initializeSimulation = useCallback(
    (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, width: number, height: number) => {
      const container = svg.append('g');

      // Add zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 2])
        .on('zoom', (event) => {
          container.attr('transform', event.transform);
        });

      svg.call(zoom);

      const links = nodes.flatMap((node) =>
        node.connections.map((target) => ({
          source: node.id,
          target,
        }))
      );

      // Draw links
      const linkElements = container
        .append('g')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', '#4B5563')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2);

      simulationRef.current = d3
        .forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(-150))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force(
          'link',
          d3
            .forceLink(links)
            .id((d: any) => d.id)
            .distance(100)
        )
        .force('collision', d3.forceCollide().radius(50));

      simulationRef.current.on('tick', () => {
        linkElements
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        const newPositions: Record<string, NodePosition> = {};
        nodes.forEach((node: any) => {
          if (node.x !== undefined && node.y !== undefined) {
            newPositions[node.id] = { 
              x: Math.max(50, Math.min(width - 50, node.x)),
              y: Math.max(50, Math.min(height - 50, node.y))
            };
          }
        });
        onTick(newPositions);
      });

      return {
        cleanup: () => {
          if (simulationRef.current) {
            simulationRef.current.stop();
          }
        },
      };
    },
    [nodes, onTick]
  );

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.stop();
      simulationRef.current = null;
    }
  }, []);

  return {
    initializeSimulation,
    stopSimulation,
  };
};