import { ESNMetrics } from "@/reservoir/types/ESNTypes";
import { ESNMetricsCard } from "./ESNMetricsCard";

interface ESNMetricsGridProps {
  metrics: ESNMetrics[];
}

export function ESNMetricsGrid({ metrics }: ESNMetricsGridProps) {
  if (metrics.length === 0) return null;

  const latest = metrics[metrics.length - 1];
  const previous = metrics.length > 1 ? metrics[metrics.length - 2] : null;

  return (
    <div className="grid grid-cols-3 gap-4">
      <ESNMetricsCard
        label="Accuracy"
        metrics={latest}
        trend={previous ? 
          latest.accuracy > previous.accuracy : null
        }
      />
      <ESNMetricsCard
        label="Stability"
        metrics={latest}
        trend={previous ?
          latest.stability > previous.stability : null
        }
      />
      <ESNMetricsCard
        label="Complexity"
        metrics={latest}
        trend={previous ?
          latest.complexity > previous.complexity : null
        }
      />
    </div>
  );
}