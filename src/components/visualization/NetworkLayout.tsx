import { useEffect, useRef, useState } from 'react'
import { NetworkData, NetworkStats } from '@/bio/visualization/types'
import { NetworkContainer } from './NetworkContainer'
import { NetworkControls } from './NetworkControls'
import { NetworkStats as NetworkStatsComponent } from './NetworkStats'
import { BaseVisualizer } from '@/bio/visualization/core/BaseVisualizer'
import { Logger } from '@/cogutil/Logger'

interface NetworkLayoutProps {
  visualizer: typeof BaseVisualizer;
  data: NetworkData;
  onDepthChange?: (depth: number) => void;
  className?: string;
}

export function NetworkLayout({
  visualizer: Visualizer,
  data,
  onDepthChange,
  className
}: NetworkLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<BaseVisualizer | null>(null);
  const [depth, setDepth] = useState(2);
  const [stats, setStats] = useState<NetworkStats>({
    nodes: 0,
    edges: 0,
    density: 0,
    avgDegree: 0
  });

  useEffect(() => {
    if (containerRef.current && !instance) {
      const vis = new Visualizer(containerRef.current);
      setInstance(vis);
      return () => vis.dispose();
    }
  }, [Visualizer]);

  useEffect(() => {
    if (instance && data) {
      instance.updateData(data);
      setStats(instance.calculateStats(data));
    }
  }, [instance, data]);

  const handleDepthChange = (newDepth: number) => {
    setDepth(newDepth);
    onDepthChange?.(newDepth);
  };

  const handleRefresh = () => {
    if (instance && data) {
      instance.updateData(data);
    }
  };

  const handleReset = () => {
    if (containerRef.current && instance) {
      instance.dispose();
      const vis = new Visualizer(containerRef.current);
      setInstance(vis);
      vis.updateData(data);
    }
  };

  return (
    <div className={className}>
      <NetworkControls
        depth={depth}
        onDepthChange={handleDepthChange}
        onRefresh={handleRefresh}
        onReset={handleReset}
      />
      <NetworkContainer containerRef={containerRef} />
      <NetworkStatsComponent stats={stats} />
    </div>
  );
}