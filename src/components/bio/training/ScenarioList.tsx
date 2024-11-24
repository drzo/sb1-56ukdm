import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrainingScenario } from "@/bio/training/types"

interface ScenarioListProps {
  scenarios: TrainingScenario[];
  activeScenario: TrainingScenario | null;
  onStartScenario: (id: string) => void;
  error?: string | null;
}

export function ScenarioList({ 
  scenarios, 
  activeScenario, 
  onStartScenario,
  error 
}: ScenarioListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Scenarios</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <div className="space-y-2">
          {scenarios.map(scenario => (
            <div key={scenario.id} className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{scenario.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Difficulty: {scenario.difficulty}
                </p>
              </div>
              <Button
                onClick={() => onStartScenario(scenario.id)}
                disabled={activeScenario !== null}
              >
                Start
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}