import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ESNMetrics } from "@/reservoir/types/ESNTypes";

interface ESNMetricsSummaryProps {
  metrics: ESNMetrics[];
}

export function ESNMetricsSummary({ metrics }: ESNMetricsSummaryProps) {
  if (metrics.length === 0) return null;

  const averageMetrics = {
    accuracy: metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length,
    stability: metrics.reduce((sum, m) => sum + m.stability, 0) / metrics.length,
    complexity: metrics.reduce((sum, m) => sum + m.complexity, 0) / metrics.length
  };

  const bestMetrics = metrics.reduce((best, current) => {
    const currentScore = current.accuracy + current.stability;
    const bestScore = best.accuracy + best.stability;
    return currentScore > bestScore ? current : best;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Average Performance</h4>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Accuracy:</dt>
                <dd>{(averageMetrics.accuracy * 100).toFixed(1)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Stability:</dt>
                <dd>{(averageMetrics.stability * 100).toFixed(1)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Complexity:</dt>
                <dd>{averageMetrics.complexity.toFixed(3)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Best Performance</h4>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Accuracy:</dt>
                <dd>{(bestMetrics.accuracy * 100).toFixed(1)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Stability:</dt>
                <dd>{(bestMetrics.stability * 100).toFixed(1)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Complexity:</dt>
                <dd>{bestMetrics.complexity.toFixed(3)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}