import { useEffect } from 'react';
import { useSheafStore } from '../store/sheafStore';
import { useInstanceStore } from '../store/instanceStore';
import { useMemoryStore } from '../store/memoryStore';

export const useSheafPropagation = (nodeId: string) => {
  const sheafStore = useSheafStore();
  const instanceStore = useInstanceStore();
  const memoryStore = useMemoryStore();

  useEffect(() => {
    // Subscribe to memory changes
    const unsubscribe = memoryStore.subscribe((state) => {
      const node = state.nodes.find(n => n.id === nodeId);
      if (!node) return;

      // Update sheaf node when memory changes
      sheafStore.updateBranch(nodeId, node.content);

      // Propagate changes to connected nodes
      node.connections.forEach(conn => {
        const targetNode = state.nodes.find(n => n.id === conn.targetId);
        if (!targetNode) return;

        // Calculate resonance between nodes
        const resonance = sheafStore.calculateResonance(
          conn.sourceHeight,
          conn.targetHeight
        );

        // Update target node metrics
        memoryStore.updateNode(conn.targetId, {
          metrics: {
            ...targetNode.metrics,
            resonance: targetNode.metrics.resonance + (resonance * conn.strength)
          }
        });
      });
    });

    return () => {
      unsubscribe();
    };
  }, [nodeId]);

  return {
    propagateChanges: () => sheafStore.propagateChanges(nodeId),
    mergeBranches: (heights: number[]) => sheafStore.mergeBranches(nodeId, heights),
    getBranch: (height: number) => sheafStore.getBranch(nodeId, height)
  };
};