import { Button } from "@/components/ui/button"

interface ViewSelectorProps {
  activeView: 'protein' | 'pathway';
  onViewChange: (view: 'protein' | 'pathway') => void;
}

export function ViewSelector({ activeView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="flex gap-2">
      <Button 
        variant={activeView === 'protein' ? 'default' : 'outline'}
        onClick={() => onViewChange('protein')}
      >
        Protein Network
      </Button>
      <Button 
        variant={activeView === 'pathway' ? 'default' : 'outline'}
        onClick={() => onViewChange('pathway')}
      >
        Pathway
      </Button>
    </div>
  );
}