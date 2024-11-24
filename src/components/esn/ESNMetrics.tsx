import { ESNMetrics as ESNMetricsType } from "@/reservoir/types/ESNTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useESNMetrics } from "@/reservoir/hooks/useESNMetrics";
import { MetricsChart } from "./MetricsChart";

interface ESNMetricsProps {
  metrics: ESNMetricsType[];
}

export function ESNMetrics({ metrics }: ESNMetricsProps) {
  const { getLatestMetrics, getAverageMetrics } = useESNMetrics();

  if (metrics.length === 0) return null;

  const latest = metrics[metrics.length - 1];
  const average = getAverageMetrics();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Accuracy"
          value={latest.accuracy}
          format={v => `${(v * 100).toFixed(1)}%`}
          trend={metrics.length > 1 ? 
            latest.accuracy > metrics[metrics.length - 2].accuracy : null
          }
        />
        <MetricCard
          label="Complexity"
          value={latest.complexity}
          format={v => v.toFixed(3)}
          trend={metrics.length > 1 ?
            latest.complexity > metrics[metrics.length - 2].complexity : null
          }
        />
        <MetricCard
          label="Stability"
          value={latest.stability}
          format={v => v.toFixed(3)}
          trend={metrics.length > 1 ?
            latest.stability > metrics[metrics.length - 2].stability : null
          }
        />
      </div>

      {metrics.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Training History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-40">
              <MetricsChart metrics={metrics} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Average Accuracy</div>
                <div className="font-medium">
                  {((average?.accuracy ?? 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Epochs</div>
                <div className="font-medium">{metrics.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Last Updated</div>
                <div className="font-medium">
                  {new Date(latest.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  format: (value: number) => string;
  trend: boolean | null;
}

function MetricCard({ label, value, format, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="text-2xl font-bold">{format(value)}</div>
          {trend !== null && (
            <div className={`text-sm ${
              trend ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend ? '↑' : '↓'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}