import { useState, useEffect } from 'react';
import { VisualizationStats } from '../types/VisualizationTypes';
import { Logger } from '../../../cogutil/Logger';

export function useVisualizationStats(
  nodeCount: number,
  edgeCount: number
): VisualizationStats {
  const [stats, setStats] = useState<VisualizationStats>({
    fps: 0,
    nodeCount,
    edgeCount,
    renderTime: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const updateStats = () => {
      try {
        const currentTime = performance.now();
        frameCount++;

        if (currentTime - lastTime >= 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          const renderTime = (currentTime - lastTime) / frameCount;

          setStats(prev => ({
            ...prev,
            fps,
            renderTime,
            nodeCount,
            edgeCount
          }));

          frameCount = 0;
          lastTime = currentTime;
        }

        animationFrameId = requestAnimationFrame(updateStats);
      } catch (error) {
        Logger.error('Failed to update visualization stats:', error);
      }
    };

    updateStats();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodeCount, edgeCount]);

  return stats;
}