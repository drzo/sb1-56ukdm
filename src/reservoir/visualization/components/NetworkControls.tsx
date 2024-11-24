import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NetworkControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onLayoutChange: (layout: string) => void;
  onNodeSizeChange: (size: number) => void;
  onEdgeWidthChange: (width: number) => void;
}

export function NetworkControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onLayoutChange,
  onNodeSizeChange,
  onEdgeWidthChange
}: NetworkControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg">
      <div className="space-x-2">
        <Button onClick={onZoomIn} size="sm">Zoom In</Button>
        <Button onClick={onZoomOut} size="sm">Zoom Out</Button>
        <Button onClick={onReset} variant="outline" size="sm">Reset</Button>
      </div>

      <div className="space-y-1">
        <Label>Layout</Label>
        <Select onValueChange={onLayoutChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="force">Force Directed</SelectItem>
            <SelectItem value="circular">Circular</SelectItem>
            <SelectItem value="hierarchical">Hierarchical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Node Size</Label>
        <Input
          type="number"
          min={1}
          max={20}
          defaultValue={5}
          onChange={(e) => onNodeSizeChange(Number(e.target.value))}
          className="w-20"
        />
      </div>

      <div className="space-y-1">
        <Label>Edge Width</Label>
        <Input
          type="number"
          min={1}
          max={10}
          defaultValue={1}
          onChange={(e) => onEdgeWidthChange(Number(e.target.value))}
          className="w-20"
        />
      </div>
    </div>
  );
}