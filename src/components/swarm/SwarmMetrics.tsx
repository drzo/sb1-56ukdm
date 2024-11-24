import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SwarmMetricsProps {
  metrics: {
    agentCount: number;
    activeTaskCount: number;
    averageSuccessRate: number;
    averageCollaborationScore: number;
  };
}

export function SwarmMetrics({ metrics }: SwarmMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-2">
          <dt>Agents:</dt>
          <dd>{metrics.agentCount}</dd>
          <dt>Active Tasks:</dt>
          <dd>{metrics.activeTaskCount}</dd>
          <dt>Success Rate:</dt>
          <dd>{(metrics.averageSuccessRate * 100).toFixed(1)}%</dd>
          <dt>Collaboration:</dt>
          <dd>{(metrics.averageCollaborationScore * 100).toFixed(1)}%</dd>
        </dl>
      </CardContent>
    </Card>
  );
}