import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CellControlsProps {
  onReset: () => void;
  disabled: boolean;
}

export function CellControls({ onReset, disabled }: CellControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onReset}
          disabled={disabled}
        >
          Reset Cell
        </Button>
      </CardContent>
    </Card>
  );
}