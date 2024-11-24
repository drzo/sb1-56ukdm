import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrainingResult } from "@/bio/training/TrainingModule"

interface ResultsListProps {
  results: TrainingResult[];
}

export function ResultsList({ results }: ResultsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="border-b pb-2">
              <div className="flex justify-between">
                <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                  {result.success ? 'Success' : 'Failed'}
                </span>
                <span>Score: {(result.score * 100).toFixed(1)}%</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {result.achievements.map((achievement, i) => (
                  <div key={i}>{achievement}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}