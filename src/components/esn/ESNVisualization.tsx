import { useRef, useState } from 'react';
import { ESNState } from '@/reservoir/types/ESNTypes';
import { useESNVisualization } from '@/reservoir/hooks/useESNVisualization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ESNVisualizationProps {
  state?: ESNState;
  width?: number;
  height?: number;
}

export function ESNVisualization({ 
  state,
  width = 600, 
  height = 400 
}: ESNVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeView, setActiveView] = useState<'weights' | 'state'>('weights');
  
  const { resetZoom, updateColorScale } = useESNVisualization(svgRef, state, {
    width,
    height,
    colors: {
      positive: 'hsl(var(--success))',
      negative: 'hsl(var(--destructive))',
      neutral: 'hsl(var(--muted))',
      text: 'hsl(var(--foreground))',
      grid: 'hsl(var(--border))'
    }
  });

  if (!state) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
            <p className="text-muted-foreground">No state data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Network Visualization</CardTitle>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetZoom}
            >
              Reset View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateColorScale([-1, 1])}
            >
              Reset Scale
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'weights' | 'state')}>
          <TabsList>
            <TabsTrigger value="weights">Weight Matrix</TabsTrigger>
            <TabsTrigger value="state">State Vector</TabsTrigger>
          </TabsList>

          <TabsContent value="weights" className="mt-4">
            <div className="relative bg-card rounded-lg overflow-hidden">
              <svg 
                ref={svgRef}
                className="w-full"
                style={{ minHeight: '400px' }}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/80 p-2 rounded">
                <div className="w-24 h-2 bg-gradient-to-r from-destructive via-muted to-success" />
                <div className="text-xs">
                  <span>-1</span>
                  <span className="mx-2">0</span>
                  <span>1</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="state" className="mt-4">
            <div className="space-y-4">
              <div className="h-40 bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">State Vector</span>
                  <span className="text-sm text-muted-foreground">
                    Size: {state.state.length}
                  </span>
                </div>
                <div className="relative h-24">
                  {state.state.map((value, i) => (
                    <div
                      key={i}
                      className="absolute bottom-0 bg-primary"
                      style={{
                        left: `${(i / state.state.length) * 100}%`,
                        width: `${100 / state.state.length}%`,
                        height: `${Math.abs(value) * 100}%`,
                        opacity: 0.8
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StateMetrics 
                  state={state.state}
                  label="Statistics"
                />
                <StateMetrics 
                  state={state.state}
                  label="Distribution"
                  type="distribution"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface StateMetricsProps {
  state: number[];
  label: string;
  type?: 'stats' | 'distribution';
}

function StateMetrics({ state, label, type = 'stats' }: StateMetricsProps) {
  const stats = type === 'stats' ? {
    mean: state.reduce((a, b) => a + b, 0) / state.length,
    std: Math.sqrt(
      state.reduce((a, b) => a + Math.pow(b - state.reduce((a, b) => a + b, 0) / state.length, 2), 0) / 
      state.length
    ),
    min: Math.min(...state),
    max: Math.max(...state)
  } : {
    positive: state.filter(v => v > 0).length / state.length,
    negative: state.filter(v => v < 0).length / state.length,
    zero: state.filter(v => v === 0).length / state.length
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{label}</h4>
      <dl className="grid grid-cols-2 gap-1 text-sm">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <dt className="text-muted-foreground capitalize">{key}:</dt>
            <dd>{typeof value === 'number' ? value.toFixed(3) : value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}