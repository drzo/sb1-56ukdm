import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { TrainingData } from "@/reservoir/types/ESNTypes";
import { ESNDataGenerator } from "@/reservoir/services/ESNDataGenerator";
import { useState } from "react";

interface ESNTrainingFormProps {
  onTrain: (data: TrainingData) => Promise<void>;
  isTraining: boolean;
}

export function ESNTrainingForm({ onTrain, isTraining }: ESNTrainingFormProps) {
  const [inputSize, setInputSize] = useState(10);
  const [sequenceLength, setSequenceLength] = useState(100);
  const [validationSplit, setValidationSplit] = useState(0.2);
  const [dataType, setDataType] = useState<'sine' | 'timeseries' | 'classification'>('sine');
  const [numClasses, setNumClasses] = useState(2);

  const handleSubmit = () => {
    const generator = ESNDataGenerator.getInstance();
    let data: TrainingData;

    switch (dataType) {
      case 'timeseries':
        data = generator.generateTimeSeriesData(inputSize, sequenceLength);
        break;
      case 'classification':
        data = generator.generateClassificationData(inputSize, sequenceLength, numClasses);
        break;
      default:
        data = generator.generateSineWaveData(inputSize, sequenceLength);
    }

    onTrain({
      ...data,
      validationSplit
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataType">Data Type</Label>
          <Select
            value={dataType}
            onValueChange={(value: 'sine' | 'timeseries' | 'classification') => 
              setDataType(value)
            }
          >
            <SelectTrigger id="dataType">
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sine">Sine Wave</SelectItem>
              <SelectItem value="timeseries">Time Series</SelectItem>
              <SelectItem value="classification">Classification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inputSize">Input Size</Label>
          <Input
            id="inputSize"
            type="number"
            value={inputSize}
            onChange={(e) => setInputSize(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sequenceLength">Sequence Length</Label>
          <Input
            id="sequenceLength"
            type="number"
            value={sequenceLength}
            onChange={(e) => setSequenceLength(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="validationSplit">Validation Split</Label>
          <Input
            id="validationSplit"
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={validationSplit}
            onChange={(e) => setValidationSplit(Number(e.target.value))}
          />
        </div>

        {dataType === 'classification' && (
          <div className="space-y-2">
            <Label htmlFor="numClasses">Number of Classes</Label>
            <Input
              id="numClasses"
              type="number"
              min="2"
              value={numClasses}
              onChange={(e) => setNumClasses(Number(e.target.value))}
            />
          </div>
        )}
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={isTraining}
        className="w-full"
        variant={isTraining ? "secondary" : "default"}
      >
        {isTraining ? 'Training...' : 'Train Network'}
      </Button>
    </div>
  );
}