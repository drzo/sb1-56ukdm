import { AgentState, AgentCapability } from '../../types';
import { TruthValue } from '../../../types/Atom';
import { Logger } from '../../../cogutil/Logger';

export abstract class BaseAgent {
  protected state: AgentState;
  protected capabilities: Map<string, AgentCapability>;
  protected name: string;
  protected truthValue: TruthValue;

  constructor(
    name: string,
    capabilities: AgentCapability[] = [],
    tv?: TruthValue
  ) {
    this.name = name;
    this.capabilities = new Map(
      capabilities.map(cap => [cap.name, cap])
    );
    this.truthValue = tv || { strength: 1.0, confidence: 1.0 };
    this.state = this.initializeState();

    Logger.info(`Base agent ${name} initialized`);
  }

  protected initializeState(): AgentState {
    return {
      status: 'idle',
      collaborators: [],
      resources: [],
      memory: {},
      goals: [],
      beliefs: new Map(),
      intentions: [],
      plans: [],
      energy: 100,
      performance: {
        successRate: 1.0,
        taskCompletion: 1.0,
        collaborationScore: 1.0,
        learningProgress: 0.0
      }
    };
  }

  getName(): string {
    return this.name;
  }

  getState(): AgentState {
    return { ...this.state };
  }

  getCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities.values());
  }

  hasCapability(name: string): boolean {
    return this.capabilities.has(name);
  }

  getTruthValue(): TruthValue {
    return { ...this.truthValue };
  }

  abstract update(): Promise<void>;
}