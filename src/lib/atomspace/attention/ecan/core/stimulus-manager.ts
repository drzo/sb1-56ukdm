import { Atom } from '../../../types';
import { ECANConfig } from '../config/ecan-config';
import { StimulusProcessor } from './stimulus/stimulus-processor';
import { StimulusAmplification } from './stimulus/stimulus-amplification';
import { ContextualStimulus } from './stimulus/contextual-stimulus';

export class StimulusManager {
  private processor: StimulusProcessor;
  private amplification: StimulusAmplification;
  private contextual: ContextualStimulus;

  constructor(
    private atomSpace: Map<string, Atom>,
    private config: ECANConfig
  ) {
    this.processor = new StimulusProcessor(config);
    this.amplification = new StimulusAmplification(config);
    this.contextual = new ContextualStimulus(atomSpace, config);
  }

  processStimulus(atom: Atom, stimulus: number, context?: Atom): Atom {
    // 1. Amplify stimulus based on configuration
    const amplifiedStimulus = this.amplification.amplifyStimulus(stimulus);
    
    // 2. Adjust stimulus based on context if available
    const adjustedStimulus = context
      ? this.contextual.adjustStimulus(amplifiedStimulus, atom, context)
      : amplifiedStimulus;
    
    // 3. Process the final stimulus value
    return this.processor.processStimulus(atom, adjustedStimulus);
  }
}