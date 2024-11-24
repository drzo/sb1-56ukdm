import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CellMetricsProps {
  metrics: {
    energy: number;
    efficiency: number;
    stress: number;
    mitochondria: number;
  };
}

export function CellMetrics({ metrics }: CellMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-2">
          <dt>Energy Level:</dt>
          <dd>{(metrics.energy * 100).toFixed(1)}%</dd>
          <dt>Efficiency:</dt>
          <dd>{(metrics.efficiency * 100).toFixed(1)}%</dd>
          <dt>Stress Level:</dt>
          <dd>{(metrics.stress * 100).toFixed(1)}%</dd>
          <dt>Mitochondria:</dt>
          <dd>{metrics.mitochondria}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}