import { TrainingData } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export class CrossValidator {
  createFolds(data: TrainingData, numFolds: number = 5): Array<{
    training: TrainingData;
    validation: TrainingData;
  }> {
    try {
      const folds: Array<{
        training: TrainingData;
        validation: TrainingData;
      }> = [];

      const foldSize = Math.floor(data.inputs.length / numFolds);

      for (let i = 0; i < numFolds; i++) {
        const validationStart = i * foldSize;
        const validationEnd = validationStart + foldSize;

        const validationInputs = data.inputs.slice(validationStart, validationEnd);
        const validationTargets = data.targets.slice(validationStart, validationEnd);

        const trainingInputs = [
          ...data.inputs.slice(0, validationStart),
          ...data.inputs.slice(validationEnd)
        ];
        const trainingTargets = [
          ...data.targets.slice(0, validationStart),
          ...data.targets.slice(validationEnd)
        ];

        folds.push({
          training: {
            inputs: trainingInputs,
            targets: trainingTargets
          },
          validation: {
            inputs: validationInputs,
            targets: validationTargets
          }
        });
      }

      Logger.debug(`Created ${numFolds} cross-validation folds`);
      return folds;
    } catch (error) {
      Logger.error('Failed to create cross-validation folds:', error);
      throw error;
    }
  }

  calculateAverageMetrics(metricsArray: any[]): any {
    return metricsArray.reduce((avg, metrics, _, { length }) => {
      Object.keys(metrics).forEach(key => {
        if (typeof metrics[key] === 'number') {
          avg[key] = (avg[key] || 0) + metrics[key] / length;
        }
      });
      return avg;
    }, {});
  }
}