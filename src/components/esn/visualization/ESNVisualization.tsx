import { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NetworkVisualizer } from '@/reservoir/visualization/core/NetworkVisualizer';
import { NetworkControls } from '@/reservoir/visualization/components/NetworkControls';
import { NetworkStats } from '@/reservoir/visualization/components/NetworkStats';
import { useVisualizationStats } from '@/reservoir/visualization/hooks/useVisualizationStats';
import { useMultiReservoir } from '@/reservoir/hooks/useMultiReservoir';
import { Logger } from '@/cogutil/Logger';

interface ESNVisualizationProps {
  reservoirIds: string[];
  onRemoveReservoir: (id: string) => void;
}

export function ESNVisualization({ 
  reservoirIds,
  onRemoveReservoir 
}: ESNVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<NetworkVisualizer>();
  const { getReservoirMetrics } = useMultiReservoir();

  const stats = useVisualizationStats(
    reservoirIds.length,
    reservoirIds.length * (reservoirIds.length - 1) / 2
  );

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      visualizerRef.current = new NetworkVisualizer(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 400,
        nodeSize: 5,
        edgeWidth: 1,
        colors: {
          node: 'hsl(var(--primary))',
          edge: 'hsl(var(--muted))',
          text: 'hsl(var(--foreground))',
          background: 'hsl(var(--background))'
        }
      });

      return () => {
        visualizerRef.current?.dispose();
      };
    } catch (error) {
      Logger.error('Failed to initialize network visualizer:', error);
    }
  }, []);

  useEffect(() => {
    if (!visualizerRef.current) return;

    try {
      const nodes = reservoirIds.map(id => ({
        id,
        type: 'reservoir' as const,
        value: getReservoirMetrics(id).length > 0 ? 
          getReservoirMetrics(id)[getReservoirMetrics(id).length - 1].accuracy : 0
      }));

      const edges = reservoirIds.flatMap((id1, i) => 
        reservoirIds.slice(i + 1).map(id2 => ({
          source: id1,
          target: id2,
          weight: 0.5 // Could be based on correlation between reservoirs
        }))
      );

      visualizerRef.current.updateData({ nodes, edges });
    } catch (error) {
      Logger.error('Failed to update network visualization:', error);
    }
  }, [reservoirIds, getReservoirMetrics]);

  const handleLayoutChange = (layout: string) => {
    visualizerRef.current?.setLayout(layout);
  };

  const handleNodeSizeChange = (size: number) => {
    visualizerRef.current?.setNodeSize(size);
  };

  const handleEdgeWidthChange = (width: number) => {
    visualizerRef.current?.setEdgeWidth(width);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Visualization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NetworkControls
          onZoomIn={() => visualizerRef.current?.zoomIn()}
          onZoomOut={() => visualizerRef.current?.zoomOut()}
          onReset={() => visualizerRef.current?.resetView()}
          onLayoutChange={handleLayoutChange}
          onNodeSizeChange={handleNodeSizeChange}
          onEdgeWidthChange={handleEdgeWidthChange}
        />

        <div 
          ref={containerRef} 
          className="w-full h-[400px] bg-muted rounded-lg"
        />

        <NetworkStats stats={stats} />

        <div className="grid grid-cols-3 gap-2">
          {reservoirIds.map(id => (
            <Button
              key={id}
              variant="outline"
              size="sm"
              onClick={() => onRemoveReservoir(id)}
            >
              Remove {id}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}