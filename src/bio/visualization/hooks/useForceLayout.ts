import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NetworkData, NetworkNode, NetworkEdge } from '../types';
import { Logger } from '@/cogutil/Logger';

interface ForceLayoutConfig {
  width: number;
  height: number;
  strength?: number;
  distance?: number;
}

export function useForceLayout(data: NetworkData, config: ForceLayoutConfig) {
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkEdge>>();

  useEffect(() => {
    try {
      simulationRef.current = d3.forceSimulation<NetworkNode, NetworkEdge>()
        .force('charge', d3.forceManyBody().strength(config.strength || -50))
        .force('center', d3.forceCenter(config.width / 2, config.height / 2))
        .force('link', d3.forceLink<NetworkNode, NetworkEdge>()
          .id(d => d.id)
          .distance(config.distance || 30)
        );

      Logger.info('Force layout initialized');

      return () => {
        simulationRef.current?.stop();
        Logger.info('Force layout stopped');
      };
    } catch (error) {
      Logger.error('Failed to initialize force layout:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!simulationRef.current) return;

    simulationRef.current.nodes(data.nodes);
    simulationRef.current
      .force<d3.ForceLink<NetworkNode, NetworkEdge>>('link')
      ?.links(data.edges);
    
    simulationRef.current.alpha(1).restart();
  }, [data]);

  const getNodePosition = (nodeId: string) => {
    const node = simulationRef.current?.nodes().find(n => n.id === nodeId);
    return node ? { x: node.x || 0, y: node.y || 0 } : { x: 0, y: 0 };
  };

  const stop = () => {
    simulationRef.current?.stop();
  };

  return {
    simulation: simulationRef.current,
    getNodePosition,
    stop
  };
}