import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ESNOptimizationControlsProps {
  reservoirId: string;
  onOptimize: (params: OptimizationParams) => Promise<void>;
}

interface OptimizationParams {
  strategy: 'genetic' | 'grid' | 'random';
  populationSize?: number;
  generations?: number;
  searchSpace?: {
    spectralRadius: [number, number];
    inputScaling: [number, number];
    leakingRate: [number, number];
    sparsity: [number, number];
  };
}

export function ESNOptimizationControls({ 
  reservoirId, 
  onOptimize 
}: ESNOptimizationControlsProps) {
  const [strategy, setStrategy] = useState<'genetic' | 'grid' | 'random'>('genetic');
  const [populationSize, setPopulationSize] = useState(20);
  const [generations, setGenerations] = useState(50);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    try {
      setIsOptimizing(true);
      await onOptimize({
        strategy,
        populationSize,
        generations,
        searchSpace: {
          spectralRadius: [0.1, 1.0],
          inputScaling: [0.1, 2.0],
          leakingRate: [0.1, 0.9],
          sparsity: [0.1, 0.9]
        }
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Optimization Strategy</Label>
            <Select
              value={strategy}
              onValueChange={(value: 'genetic' | 'grid' | 'random') => 
                setStrategy(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="genetic">Genetic Algorithm</SelectItem>
                <SelectItem value="grid">Grid Search</SelectItem>
                <SelectItem value="random">Random Search</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {strategy === 'genetic' && (
            <>
              <div className="space-y-2">
                <Label>Population Size</Label>
                <Input
                  type="number"
                  value={populationSize}
                  onChange={(e) => setPopulationSize(Number(e.target.value))}
                  min={10}
                  max={100}
                />
              </div>

              <div className="space-y-2">
                <Label>Generations</Label>
                <Input
                  type="number"
                  value={generations}
                  onChange={(e) => setGenerations(Number(e.target.value))}
                  min={10}
                  max={200}
                />
              </div>
            </>
          )}

          <Button 
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="w-full"
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Parameters'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}