import { Card, CardContent } from "@/components/ui/card";
import { VisualizationStats } from "../types/VisualizationTypes";

interface NetworkStatsProps {
  stats: VisualizationStats;
}

export function NetworkStats({ stats }: NetworkStatsProps) {
  return (
    <Card>
      <CardContent className="grid grid-cols-4 gap-4 p-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">FPS</div>
          <div className="text-2xl font-bold">{stats.fps.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Nodes</div>
          <div className="text-2xl font-bold">{stats.nodeCount}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Edges</div>
          <div className="text-2xl font-bold">{stats.edgeCount}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Render Time</div>
          <div className="text-2xl font-bold">{stats.renderTime.toFixed(1)}ms</div>
        </div>
      </CardContent>
    </Card>
  );
}