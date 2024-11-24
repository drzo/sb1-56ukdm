import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface ReasoningFormProps {
  subject: string;
  category: string;
  property: string;
  onSubjectChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPropertyChange: (value: string) => void;
  onSubmit: () => void;
  isConnected: boolean;
}

export function ReasoningForm({
  subject,
  category,
  property,
  onSubjectChange,
  onCategoryChange,
  onPropertyChange,
  onSubmit,
  isConnected
}: ReasoningFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="property">Property</Label>
          <Input
            id="property"
            value={property}
            onChange={(e) => onPropertyChange(e.target.value)}
          />
        </div>
      </div>
      <Button onClick={onSubmit} disabled={!isConnected}>Run MeTTa</Button>
    </div>
  );
}