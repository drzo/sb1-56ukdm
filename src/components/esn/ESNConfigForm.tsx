import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ESNConfig } from "@/reservoir/types/ESNTypes";

interface ESNConfigFormProps {
  config: ESNConfig;
  onConfigChange: (key: keyof ESNConfig, value: string | boolean) => void;
  showAdvanced?: boolean;
}

export function ESNConfigForm({ 
  config, 
  onConfigChange, 
  showAdvanced = false 
}: ESNConfigFormProps) {
  return (
    <div className="space-y-4">
      {/* Basic Parameters */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="inputSize">Input Size</Label>
          <Input
            id="inputSize"
            type="number"
            value={config.inputSize}
            onChange={(e) => onConfigChange('inputSize', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reservoirSize">Reservoir Size</Label>
          <Input
            id="reservoirSize"
            type="number"
            value={config.reservoirSize}
            onChange={(e) => onConfigChange('reservoirSize', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="spectralRadius">Spectral Radius</Label>
          <Input
            id="spectralRadius"
            type="number"
            step="0.01"
            value={config.spectralRadius}
            onChange={(e) => onConfigChange('spectralRadius', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inputScaling">Input Scaling</Label>
          <Input
            id="inputScaling"
            type="number"
            step="0.01"
            value={config.inputScaling}
            onChange={(e) => onConfigChange('inputScaling', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="leakingRate">Leaking Rate</Label>
          <Input
            id="leakingRate"
            type="number"
            step="0.01"
            value={config.leakingRate}
            onChange={(e) => onConfigChange('leakingRate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sparsity">Sparsity</Label>
          <Input
            id="sparsity"
            type="number"
            step="0.01"
            value={config.sparsity}
            onChange={(e) => onConfigChange('sparsity', e.target.value)}
          />
        </div>
      </div>

      {/* ReservoirPy Features */}
      {showAdvanced && (
        <div className="space-y-4 border-t pt-4">
          <h4 className="font-medium">Advanced Features</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback Connections</Label>
              <Switch
                id="feedback"
                checked={config.feedback}
                onCheckedChange={(checked) => onConfigChange('feedback', checked)}
              />
            </div>

            {config.feedback && (
              <div className="space-y-2">
                <Label htmlFor="fbScaling">Feedback Scaling</Label>
                <Input
                  id="fbScaling"
                  type="number"
                  step="0.01"
                  value={config.fbScaling}
                  onChange={(e) => onConfigChange('fbScaling', e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="regressionMethod">Regression Method</Label>
              <Select
                value={config.regressionMethod}
                onValueChange={(value) => onConfigChange('regressionMethod', value)}
              >
                <SelectTrigger id="regressionMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ridge">Ridge</SelectItem>
                  <SelectItem value="pinv">Pseudo-Inverse</SelectItem>
                  <SelectItem value="lasso">Lasso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="washoutLength">Washout Length</Label>
              <Input
                id="washoutLength"
                type="number"
                value={config.washoutLength}
                onChange={(e) => onConfigChange('washoutLength', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="readoutRegularization">Readout Regularization</Label>
              <Input
                id="readoutRegularization"
                type="number"
                step="0.000001"
                value={config.readoutRegularization}
                onChange={(e) => onConfigChange('readoutRegularization', e.target.value)}
              />
            </div>
          </div>

          {config.regressionMethod === 'ridge' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="solverAlpha">Solver Alpha</Label>
                <Input
                  id="solverAlpha"
                  type="number"
                  step="0.000001"
                  value={config.solverArgs?.alpha}
                  onChange={(e) => onConfigChange('solverArgs', JSON.stringify({
                    ...config.solverArgs,
                    alpha: Number(e.target.value)
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solverMaxIter">Max Iterations</Label>
                <Input
                  id="solverMaxIter"
                  type="number"
                  value={config.solverArgs?.max_iter}
                  onChange={(e) => onConfigChange('solverArgs', JSON.stringify({
                    ...config.solverArgs,
                    max_iter: Number(e.target.value)
                  }))}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}