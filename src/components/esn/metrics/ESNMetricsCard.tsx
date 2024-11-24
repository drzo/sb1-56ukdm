import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ESNMetrics } from "@/reservoir/types/ESNTypes";

interface ESNMetricsCardProps {
  metrics: ESNMetrics;
  label: string;
  trend?: boolean | null;
}

export function ESNMetricsCard({ metrics, label, trend }: ESNMetricsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="text-2xl font-bold">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          {trend !== null && (
            <div className={`text-sm ${
              trend ? 'text-green-500' : 'text-red-500'
            }`}>
              {trend ? '↑' : '↓'}
            </div>
          )}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
          <div className="text-muted-foreground">Stability:</div>
          <div>{(metrics.stability * 100).toFixed(1)}%</div>
          <div className="text-muted-foreground">Complexity:</div>
          <div>{metrics.complexity.toFixed(3)}</div>
        </div>
      </CardContent>
    </Card>
  );
}