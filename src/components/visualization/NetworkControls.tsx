import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NetworkControlsProps {
  onDepthChange: (depth: number) => void;
  onRefresh: () => void;
  onReset: () => void;
  depth: number;
}

export function NetworkControls({
  onDepthChange,
  onRefresh,
  onReset,
  depth
}: NetworkControlsProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="space-y-1">
        <Label>Visualization Depth</Label>
        <Input
          type="number"
          min={1}
          max={5}
          value={depth}
          onChange={(e) => onDepthChange(parseInt(e.target.value))}
          className="w-24"
        />
      </div>
      <Button onClick={onRefresh}>Refresh</Button>
      <Button variant="outline" onClick={onReset}>Reset View</Button>
    </div>
  );
}