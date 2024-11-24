import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMultiReservoir } from '@/reservoir/hooks/useMultiReservoir';
import { ESNConfig } from '@/reservoir/types/ESNTypes';
import { ESNConfigForm } from './ESNConfigForm';
import { ESNMetrics } from './ESNMetrics';
import { ESNVisualization } from './visualization/ESNVisualization';
import { ESNEnsembleMetrics } from './ESNEnsembleMetrics';
import { ESNOptimizationControls } from './ESNOptimizationControls';

const DEFAULT_CONFIG: ESNConfig = {
  inputSize: 64,
  reservoirSize: 500,
  spectralRadius: 0.95,
  inputScaling: 0.1,
  leakingRate: 0.3,
  sparsity: 0.1,
  ridgeParam: 1e-6,
  activationFunction: 'tanh',
  bias: 1.0,
  randomSeed: Date.now(),
  inputBias: true,
  feedbackScaling: 0,
  washoutLength: 100,
  readoutRegularization: 1e-6
};

export function ESNEnsembleView() {
  const [config, setConfig] = useState<ESNConfig>(DEFAULT_CONFIG);
  const {
    reservoirIds,
    error,
    metrics,
    addReservoir,
    removeReservoir,
    processEnsemble,
    optimizeEnsemble,
    getEnsembleWeights,
    clearError
  } = useMultiReservoir();

  const handleAddReservoir = async () => {
    const id = `reservoir-${reservoirIds.length + 1}`;
    await addReservoir(id, config);
  };

  const handleOptimize = async (params: any) => {
    // Generate validation data
    const validationData = Array.from({ length: 100 }, (_, i) => ({
      input: new Float32Array([Math.sin(i * 0.1)]),
      target: new Float32Array([Math.sin((i + 1) * 0.1)])
    }));

    await optimizeEnsemble(validationData);
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>ESN Ensemble Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            <ESNConfigForm 
              config={config}
              onConfigChange={(key, value) => 
                setConfig(prev => ({ ...prev, [key]: Number(value) }))
              }
            />

            <Button 
              onClick={handleAddReservoir}
              className="w-full"
            >
              Add Reservoir
            </Button>
          </div>
        </CardContent>
      </Card>

      {reservoirIds.length > 0 && (
        <>
          <ESNEnsembleMetrics 
            metrics={metrics}
            weights={getEnsembleWeights()}
          />

          <ESNVisualization 
            reservoirIds={reservoirIds}
            onRemoveReservoir={removeReservoir}
          />

          <ESNOptimizationControls 
            reservoirId={reservoirIds[0]}
            onOptimize={handleOptimize}
          />
        </>
      )}
    </div>
  );
}