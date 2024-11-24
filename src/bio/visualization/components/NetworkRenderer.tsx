import { useEffect, useRef } from 'react';
import { NetworkData, NetworkConfig } from '../types';
import { use3DScene } from '../hooks/use3DScene';
import { useForceLayout } from '../hooks/useForceLayout';
import { useNetworkStats } from '../hooks/useNetworkStats';
import { Logger } from '@/cogutil/Logger';

interface NetworkRendererProps {
  data: NetworkData;
  config: NetworkConfig;
  onStatsChange?: (stats: NetworkStats) => void;
}

export function NetworkRenderer({
  data,
  config,
  onStatsChange
}: NetworkRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scene, camera, renderer, isInitialized, resize } = use3DScene(
    containerRef.current,
    {
      width: config.width,
      height: config.height,
      backgroundColor: config.colors.background
    }
  );

  const { simulation, getNodePosition } = useForceLayout(data, {
    width: config.width,
    height: config.height
  });

  const stats = useNetworkStats(data);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      // Update visualization based on layout changes
      simulation?.on('tick', () => {
        // Update node positions
        data.nodes.forEach(node => {
          const position = getNodePosition(node.id);
          const mesh = scene?.getObjectByName(`node-${node.id}`);
          if (mesh) {
            mesh.position.set(position.x, position.y, 0);
          }
        });

        // Update edge positions
        data.edges.forEach(edge => {
          const line = scene?.getObjectByName(`edge-${edge.source}-${edge.target}`);
          if (line) {
            const sourcePos = getNodePosition(edge.source);
            const targetPos = getNodePosition(edge.target);
            const positions = new Float32Array([
              sourcePos.x, sourcePos.y, 0,
              targetPos.x, targetPos.y, 0
            ]);
            (line.geometry as THREE.BufferGeometry)
              .setAttribute('position', new THREE.BufferAttribute(positions, 3));
          }
        });
      });
    } catch (error) {
      Logger.error('Failed to update network visualization:', error);
    }
  }, [isInitialized, data]);

  useEffect(() => {
    onStatsChange?.(stats);
  }, [stats]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ width: config.width, height: config.height }}
    />
  );
}