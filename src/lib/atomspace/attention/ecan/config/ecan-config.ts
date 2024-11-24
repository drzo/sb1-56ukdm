export interface ECANConfig {
  // Attention allocation parameters
  maxSTI: number;          // Maximum Short-Term Importance
  minSTI: number;          // Minimum Short-Term Importance
  maxLTI: number;          // Maximum Long-Term Importance
  minLTI: number;          // Minimum Long-Term Importance
  attentionDecayRate: number;  // Base decay rate for attention values
  
  // Hebbian learning parameters
  hebbianLearningRate: number;  // Rate of Hebbian link strength updates
  hebbianDecayRate: number;     // Decay rate for Hebbian links
  
  // Importance spreading parameters
  spreadingFactor: number;      // Factor controlling importance diffusion
  spreadingThreshold: number;   // Minimum STI for spreading
  
  // Tournament selection parameters
  tournamentSize: number;       // Size of tournament for selection
  selectionPressure: number;    // Pressure for tournament selection
  
  // Advanced dynamics parameters
  stiNonLinearityFactor: number;  // Controls non-linear STI dynamics
  ltiStabilityFactor: number;     // Controls LTI stability
  vltiThreshold: number;          // Threshold for VLTI status
  attentionBandwidth: number;     // Maximum attention allocation per cycle
  
  // Forgetting parameters
  forgettingThreshold: number;    // Threshold for atom removal
  maxForgettingPercentage: number; // Maximum % of atoms to forget per cycle
  
  // Stimulus parameters
  stimulusAmplification: number;  // Amplification of incoming stimuli
  contextualStimulus: boolean;    // Enable context-aware stimulus
  
  // Rent parameters
  rentScale: number;              // Base rent collection rate
  vltiRentDiscount: number;       // Rent discount for VLTI atoms
}

export const defaultECANConfig: ECANConfig = {
  // Attention allocation - Balanced for stability and responsiveness
  maxSTI: 100,
  minSTI: -100,
  maxLTI: 100,
  minLTI: 0,
  attentionDecayRate: 0.05,  // Reduced for more stable attention

  // Hebbian learning - Tuned for gradual, stable learning
  hebbianLearningRate: 0.08,
  hebbianDecayRate: 0.03,

  // Importance spreading - Optimized for controlled diffusion
  spreadingFactor: 0.4,
  spreadingThreshold: 0.15,

  // Tournament selection - Balanced selection pressure
  tournamentSize: 4,
  selectionPressure: 0.65,

  // Advanced dynamics - Fine-tuned for natural behavior
  stiNonLinearityFactor: 0.6,
  ltiStabilityFactor: 0.4,
  vltiThreshold: 0.75,
  attentionBandwidth: 0.25,

  // Forgetting - Conservative removal strategy
  forgettingThreshold: 0.1,
  maxForgettingPercentage: 0.03,

  // Stimulus - Enhanced contextual processing
  stimulusAmplification: 1.2,
  contextualStimulus: true,

  // Rent - Balanced economic pressure
  rentScale: 0.8,
  vltiRentDiscount: 0.85
};