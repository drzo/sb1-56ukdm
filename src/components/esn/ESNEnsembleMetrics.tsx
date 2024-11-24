import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ESNMetrics } from "@/reservoir/types/ESNTypes";
import { ESNMetricsGrid } from "./metrics/ESNMetricsGrid";
import { ESNMetricsChart } from "./metrics/ESNMetricsChart";
import { ESNMetricsSummary } from "./metrics/ESNMetricsSummary";

interface ESNEnsembleMetricsProps {
  metrics: Map<string, ESNMetrics[]>;
  weights: Map<string, number>;
}

export function ESNEnsembleMetrics({ metrics, weights }: ESNEnsembleMetricsProps) {
  const calculateEnsemblePerformance = () => {
    let totalAccuracy = 0;
    let totalStability = 0;
    let count = 0;

    metrics.forEach((reservoirMetrics) => {
      if (reservoirMetrics.length > 0) {
        const latest = reservoirMetrics[reservoirMetrics.length - 1];
        const weight = weights.get(latest.id) || 0;
        totalAccuracy += latest.accuracy * weight;
        totalStability += latest.stability * weight;
        count++;
      }
    });

    return {
      accuracy: count > 0 ? totalAccuracy / count : 0,
      stability: count > 0 ? totalStability / count : 0
    };
  };

  const performance = calculateEnsemblePerformance();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ensemble Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Weighted Accuracy
              </div>
              <div className="text-2xl font-bold">
                {(performance.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Weighted Stability
              </div>
              <div className="text-2xl font-bold">
                {(performance.stability * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Individual Performances</h4>
            <div className="grid gap-2">
              {Array.from(metrics.entries()).map(([id, reservoirMetrics]) => {
                if (reservoirMetrics.length === 0) return null;
                const latest = reservoirMetrics[reservoirMetrics.length - 1];
                const weight = weights.get(id) || 0;

                return (
                  <div key={id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{id}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Weight: {(weight * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm">
                        Acc: {(latest.accuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-[200px]">
            <ESNMetricsChart 
              metrics={Array.from(metrics.values()).flat()}
              showLegend={false}
            />
          </div>

          <ESNMetricsGrid 
            metrics={Array.from(metrics.values()).flat()}
          />

          <ESNMetricsSummary 
            metrics={Array.from(metrics.values()).flat()}
          />
        </div>
      </CardContent>
    </Card>
  );
}