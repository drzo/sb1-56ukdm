import { useCallback, useState } from 'react';
import type { Node, Link } from '../types';

export function useNetwork(reservoirSize: number) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  const updateNetwork = useCallback((size: number) => {
    const newNodes: Node[] = [
      // Input node
      { id: 0, group: 0, value: 1, type: 'input' },
      // Reservoir nodes
      ...Array.from({ length: size }, (_, i) => ({
        id: i + 1,
        group: 1,
        value: Math.random(),
        type: 'reservoir'
      })),
      // Output node
      { id: size + 1, group: 2, value: 1, type: 'output' }
    ];

    const newLinks: Link[] = [
      // Input connections
      ...Array.from({ length: Math.floor(size * 0.3) }, () => ({
        source: 0,
        target: Math.floor(Math.random() * size) + 1,
        value: Math.random(),
        type: 'input'
      })),
      // Reservoir connections
      ...Array.from({ length: size * 2 }, () => ({
        source: Math.floor(Math.random() * size) + 1,
        target: Math.floor(Math.random() * size) + 1,
        value: Math.random(),
        type: 'reservoir'
      })),
      // Output connections
      ...Array.from({ length: Math.floor(size * 0.3) }, () => ({
        source: Math.floor(Math.random() * size) + 1,
        target: size + 1,
        value: Math.random(),
        type: 'output'
      }))
    ];

    setNodes(newNodes);
    setLinks(newLinks);
  }, []);

  return {
    nodes,
    links,
    updateNetwork
  };
}