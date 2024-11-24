import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface QueryFormProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function QueryForm({ query, onQueryChange, onSubmit, loading }: QueryFormProps) {
  return (
    <div className="space-y-2">
      <Label>Natural Language Query</Label>
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Enter your query..."
          className="flex-1"
        />
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? 'Running...' : 'Run Query'}
        </Button>
      </div>
    </div>
  );
}