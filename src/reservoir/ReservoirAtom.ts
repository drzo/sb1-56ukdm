import { ESNCore } from './core/ESNCore';
import { ESNConfig, ESNState, TrainingData, ESNMetrics } from './types/ESNTypes';
import { ESNTrainingService } from './services/ESNTrainingService';
import { ESNValidator } from './validation/ESNValidator';
import { ESNAtomSpaceMapper } from './integration/ESNAtomSpaceMapper';
import { Logger } from '../cogutil/Logger';
import { Timer } from '../cogutil/Timer';
import { Atom } from '../types/Atom';
import { NodeType } from '../types/AtomTypes';
import { ESNAtomType } from './types/AtomSpaceTypes';

export class ReservoirAtom extends Atom {
  private esn: ESNCore | null = null;
  private trainingService: ESNTrainingService;
  private config: ESNConfig | null = null;
  private atomSpaceRepresentation: Map<string, Atom>;

  constructor(id: string) {
    super(NodeType.CONCEPT, id);
    this.trainingService = ESNTrainingService.getInstance();
    this.atomSpaceRepresentation = new Map();
  }

  async initialize(config: ESNConfig): Promise<void> {
    const timer = new Timer();
    try {
      if (this.esn) {
        throw new Error('ESN already initialized');
      }

      // Store and validate config
      this.config = config;
      ESNValidator.validateConfig(config);

      // Initialize ESN core
      this.esn = new ESNCore(this.getId(), config);
      await this.esn.initialize();

      // Create AtomSpace representation
      await this.updateAtomSpaceRepresentation();

      Logger.info(`ReservoirAtom ${this.getId()} initialized in ${timer.stop()}ms`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Logger.error(`Failed to initialize ReservoirAtom ${this.getId()}:`, message);
      throw new Error(`Failed to initialize ReservoirAtom ${this.getId()}: ${message}`);
    }
  }

  // Rest of the class implementation remains the same...
}