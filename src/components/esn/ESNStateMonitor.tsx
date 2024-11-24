import { ESNState } from '@/reservoir/types/ESNTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ESNVisualization } from './ESNVisualization';

interface ESNStateMonitorProps {
  state: ESNState;
}

export function ESNStateMonitor({ state }: ESNStateMonitorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Network State Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <ESNVisualization state={state} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Input Weights</h4>
              <div className="text-sm text-muted-foreground">
                Shape: {state.weights.input.length} × {state.weights.input[0]?.length || 0}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Output Weights</h4>
              <div className="text-sm text-muted-foreground">
                Shape: {state.weights.output.length} × {state.weights.output[0]?.length || 0}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Current State</h4>
            <div className="text-sm bg-muted p-2 rounded overflow-auto max-h-24">
              [{state.state.map(v => v.toFixed(3)).join(', ')}]
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Last Updated: {new Date(state.timestamp).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}