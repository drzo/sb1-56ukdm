import { Card } from "@/components/ui/card"

interface AtomSpaceStatsProps {
  stats: {
    atomCount: number;
    nodeCount: number;
    linkCount: number;
    patterns: number;
    avgAttention: number;
  };
}

export function AtomSpaceStats({ stats }: AtomSpaceStatsProps) {
  return (
    <div className="grid grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.atomCount}</div>
        <div className="text-sm text-muted-foreground">Total Atoms</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.nodeCount}</div>
        <div className="text-sm text-muted-foreground">Nodes</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.linkCount}</div>
        <div className="text-sm text-muted-foreground">Links</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.patterns}</div>
        <div className="text-sm text-muted-foreground">Patterns</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{stats.avgAttention.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">Avg Attention</div>
      </div>
    </div>
  );
}