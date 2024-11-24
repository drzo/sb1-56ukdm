import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { TrainingScenario } from "@/bio/training/TrainingModule"

interface ActiveScenarioProps {
  scenario: TrainingScenario;
}

export function ActiveScenario({ scenario }: ActiveScenarioProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Training: {scenario.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Objectives:</Label>
          <ul className="list-disc pl-4">
            {scenario.objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
          <Label>Conditions:</Label>
          <dl className="grid grid-cols-3 gap-2">
            {Object.entries(scenario.conditions).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <dt className="text-muted-foreground">{key}:</dt>
                <dd>{(value * 100).toFixed(1)}%</dd>
              </div>
            ))}
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}