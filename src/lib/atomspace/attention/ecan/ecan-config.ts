export interface ECANConfig {
  // Attention allocation parameters
  maxSTI: number;
  minSTI: number;
  maxLTI: number;
  minLTI: number;
  attentionDecayRate: number;
  
  // Hebbian learning parameters
  hebbianLearningRate: number;
  hebbianDecayRate: number;
  
  // Importance spreading parameters
  spreadingFactor: number;
  spreadingThreshold: number;
  
  // Tournament selection parameters
  tournamentSize: number;
  selectionPressure: number;

  // Forgetting parameters
  forgettingThreshold: number;
  maxForgettingPercentage: number;

  // Rent parameters
  rentScale: number;
  vltiRentDiscount: number;

  // Stimulus parameters
  stimulusAmplification: number;
  contextualStimulus: boolean;
}

export const defaultECANConfig: ECANConfig = {
  maxSTI: 100,
  minSTI: -100,
  maxLTI: 100,
  minLTI: 0,
  attentionDecayRate: 0.1,
  
  hebbianLearningRate: 0.1,
  hebbianDecayRate: 0.05,
  
  spreadingFactor: 0.5,
  spreadingThreshold: 0.1,
  
  tournamentSize: 5,
  selectionPressure: 0.7,

  forgettingThreshold: 0.2,
  maxForgettingPercentage: 0.05,

  rentScale: 1.0,
  vltiRentDiscount: 0.9,

  stimulusAmplification: 1.5,
  contextualStimulus: true
};