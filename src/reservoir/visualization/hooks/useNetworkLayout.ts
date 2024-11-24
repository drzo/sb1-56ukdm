import { useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { NetworkData, NetworkNode, NetworkEdge } from '../types/VisualizationTypes';
import { Logger } from '../../../cogutil/Logger';

export function useNetworkLayout() {
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkEdge>>();

  const updateLayout = useCallback((data: NetworkData) => {
    try {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }

      simulationRef.current = d3.forceSimulation<NetworkNode, NetworkEdge>(data.nodes)
        .force('link', d3.forceLink<NetworkNode, NetworkEdge>(data.edges)
          .id(d => d.id)
          .strength(d => Math.abs(d.weight))
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
        );

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