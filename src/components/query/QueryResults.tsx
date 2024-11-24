import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QueryResultsProps {
  results: {
    atoms: any[];
    bioEntities: any[];
    chemicals: any[];
  } | null;
}

export function QueryResults({ results }: QueryResultsProps) {
  if (!results) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AtomSpace Results</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-48">
            {JSON.stringify(results.atoms, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bio Results</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-48">
            {JSON.stringify(results.bioEntities, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chemical Results</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-48">
            {JSON.stringify(results.chemicals, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}