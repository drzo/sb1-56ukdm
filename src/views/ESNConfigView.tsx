import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ESNConfig } from '@/reservoir/types/ESNTypes';
import { 
  ESNConfigForm,
  ESNStateMonitor,
  ESNTrainingForm,
  ESNMetrics,
  ESNEnsembleView 
} from '@/components/esn';
import { useESNState } from '@/reservoir/hooks/useESNState';
import { useESNTraining } from '@/reservoir/hooks/useESNTraining';

export function ESNConfigurationView() {
  const [activeTab, setActiveTab] = useState<'single' | 'ensemble'>('single');
  const [config, setConfig] = useState<ESNConfig>({
    inputSize: 64,
    reservoirSize: 500,
    spectralRadius: 0.95,
    inputScaling: 0.1,
    leakingRate: 0.3,
    sparsity: 0.1
  });

  const { esn, error, createESN, disposeESN, clearError } = useESNState();
  const { train, isTraining, metrics, error: trainingError } = useESNTraining(esn);

  const handleConfigChange = useCallback((key: keyof ESNConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: Number(value)
    }));
  }, []);

  const handleCreateESN = useCallback(() => {
    createESN('ESN-1', config);
  }, [config, createESN]);

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'single' | 'ensemble')}>
      <TabsList>
        <TabsTrigger value="single">Single ESN</TabsTrigger>
        <TabsTrigger value="ensemble">Ensemble</TabsTrigger>
      </TabsList>

      <TabsContent value="single">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Echo State Network Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {(error || trainingError) && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
                  {error || trainingError}
                </div>
              )}

              <div className="grid gap-4">
                <ESNConfigForm 
                  config={config}
                  onConfigChange={handleConfigChange}
                />

                <Button 
                  onClick={esn ? disposeESN : handleCreateESN}
                  variant={esn ? "destructive" : "default"}
                  className="w-full"
                >
                  {esn ? 'Reset ESN' : 'Create ESN'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {esn && (
            <>
              <ESNStateMonitor state={esn.getState()} />

              <Card>
                <CardHeader>
                  <CardTitle>Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <ESNTrainingForm 
                      onTrain={train}
                      isTraining={isTraining}
                    />
                    <ESNMetrics metrics={metrics} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </TabsContent>

      <TabsContent value="ensemble">
        <ESNEnsembleView />
      </TabsContent>
    </Tabs>
  );
}