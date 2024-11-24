import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AtomListProps {
  atoms: any[];
}

export function AtomList({ atoms }: AtomListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atoms</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
          {JSON.stringify(atoms, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}