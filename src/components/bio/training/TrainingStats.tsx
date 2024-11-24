import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TrainingStatsProps {
  stats: {
    totalSessions: number;
    averageScore: number;
    achievements: string[];
    topScenarios: Array<{ id: string; score: number }>;
  };
}

export function TrainingStats({ stats }: TrainingStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Total Sessions
              </div>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Average Score
              </div>
              <div className="text-2xl font-bold">
                {(stats.averageScore * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Top Scenarios</h4>
            <ul className="space-y-1">
              {stats.topScenarios.map(scenario => (
                <li key={scenario.id} className="flex justify-between">
                  <span>{scenario.id}</span>
                  <span>{(scenario.score * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Achievements</h4>
            <ul className="space-y-1">
              {stats.achievements.map(achievement => (
                <li key={achievement} className="text-sm">
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}