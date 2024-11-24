import { ESNConfig, ESNMetrics, TrainingData } from '../../types/ESNTypes';
import { StateManager } from '../../state/StateManager';
import { WeightManager } from '../../weights/WeightManager';

export interface TrainingStrategy {
  train(
    data: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager,
    config: ESNConfig
  ): Promise<ESNMetrics>;
  
  validate(
    data: TrainingData,
    stateManager: StateManager,
    weightManager: WeightManager
  ): Promise<ESNMetrics>;
}