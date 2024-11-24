import { useMemo } from 'react';
import { NetworkData, NetworkStats } from '../types';

export function useNetworkStats(data: NetworkData): NetworkStats {
  return useMemo(() => {
    const nodes = data.nodes.length;
    const edges = data.edges.length;
    const maxPossibleEdges = (nodes * (nodes - 1)) / 2;
    const density = maxPossibleEdges > 0 ? edges / maxPossibleEdges : 0;
    const avgDegree = nodes > 0 ? (2 * edges) / nodes : 0;

    return {
      nodes,
      edges,
      density,
      avgDegree
    };
  }, [data]);
}