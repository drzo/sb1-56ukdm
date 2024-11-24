import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddNodeFormProps {
  nodeName: string;
  nodeStrength: string;
  nodeConfidence: string;
  onNodeNameChange: (value: string) => void;
  onNodeStrengthChange: (value: string) => void;
  onNodeConfidenceChange: (value: string) => void;
  onAddNode: () => void;
  onAddLink: () => void;
  disableAddLink: boolean;
}

export function AddNodeForm({
  nodeName,
  nodeStrength,
  nodeConfidence,
  onNodeNameChange,
  onNodeStrengthChange,
  onNodeConfidenceChange,
  onAddNode,
  onAddLink,
  disableAddLink
}: AddNodeFormProps) {
  return (
    <div className="space-y-2">
      <Label>Add Node</Label>
      <div className="grid grid-cols-3 gap-4">
        <Input
          value={nodeName}
          onChange={(e) => onNodeNameChange(e.target.value)}
          placeholder="Node name"
        />
        <Input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={nodeStrength}
          onChange={(e) => onNodeStrengthChange(e.target.value)}
          placeholder="Strength"
        />
        <Input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={nodeConfidence}
          onChange={(e) => onNodeConfidenceChange(e.target.value)}
          placeholder="Confidence"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onAddNode}>Add Node</Button>
        <Button onClick={onAddLink} disabled={disableAddLink}>
          Add Link
        </Button>
      </div>
    </div>
  );
}