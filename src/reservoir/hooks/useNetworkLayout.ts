import { useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Logger } from '../../cogutil/Logger';

interface Node {
  id: number;
  type: string;
  value: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: number;
  target: number;
  weight: number;
}

export function useNetworkLayout() {
  const simulationRef = useRef<d3.Simulation<Node, Link>>();

  const updateLayout = useCallback((nodes: Node[], links: Link[]) => {
    try {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }

      simulationRef.current = d3.forceSimulation<Node, Link>(nodes)
        .force('link', d3.forceLink<Node, Link>(links)
          .id(d => d.id)
          .strength(l => Math.abs(l.weight) * 0.5)
        )
        .force('charge', d3.forceManyBody()
          .strength(d => d.type === 'input' ? -100 : -30)
        )
        .force('center', d3.forceCenter(300, 200))
        .force('x', d3.forceX()
          .strength(d => d.type === 'input' ? 0.2 : 0.1)
        )
        .force('y', d3.forceY()
          .strength(d => d.type === 'input' ? 0.2 : 0.1)
        )
        .force('collision', d3.forceCollide(10));

      Logger.debug('Network layout updated');
    } catch (error) {
      Logger.error('Failed to update network layout:', error);
    }
  }, []);

  const stopLayout = useCallback(() => {
    simulationRef.current?.stop();
  }, []);

  return {
    layout: simulationRef.current,
    updateLayout,
    stopLayout
  };
}