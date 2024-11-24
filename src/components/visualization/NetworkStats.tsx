import { Card, CardContent } from "@/components/ui/card"

interface NetworkStatsProps {
  stats: {
    nodes: number;
    edges: number;
    density: number;
    avgDegree: number;
  };
}

export function NetworkStats({ stats }: NetworkStatsProps) {
  return (
    <Card>
      <CardContent className="grid grid-cols-4 gap-4 p-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Nodes</div>
          <div className="text-2xl font-bold">{stats.nodes}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Edges</div>
          <div className="text-2xl font-bold">{stats.edges}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Density</div>
          <div className="text-2xl font-bold">{stats.density.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Avg Degree</div>
          <div className="text-2xl font-bold">{stats.avgDegree.toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  );
}