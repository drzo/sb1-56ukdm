import { Logger } from '../cogutil/Logger';
import { Timer } from '../cogutil/Timer';
import { CogAgent } from './CogAgent';

export class AgentRegistry {
  private agents: Map<string, CogAgent>;
  private runningAgents: Set<string>;

  constructor() {
    this.agents = new Map();
    this.runningAgents = new Set();
    Logger.info('AgentRegistry initialized');
  }

  public registerAgent(agent: CogAgent): void {
    if (this.agents.has(agent.getId())) {
      Logger.warn(`Agent ${agent.getId()} already registered`);
      return;
    }

    this.agents.set(agent.getId(), agent);
    Logger.info(`Registered agent: ${agent.getId()}`);
  }

  public unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.stopAgent(agentId);
      this.agents.delete(agentId);
      Logger.info(`Unregistered agent: ${agentId}`);
    }
  }

  public startAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent && !this.runningAgents.has(agentId)) {
      this.runningAgents.add(agentId);
      Logger.info(`Started agent: ${agentId}`);
    }
  }

  public stopAgent(agentId: string): void {
    if (this.runningAgents.has(agentId)) {
      this.runningAgents.delete(agentId);
      Logger.info(`Stopped agent: ${agentId}`);
    }
  }

  public async runActiveAgents(): Promise<void> {
    const timer = new Timer();
    const promises: Promise<void>[] = [];

    for (const agentId of this.runningAgents) {
      const agent = this.agents.get(agentId);
      if (agent) {
        promises.push(
          agent.run().catch(error => {
            Logger.error(`Error running agent ${agentId}:`, error);
          })
        );
      }
    }

    await Promise.all(promises);
    Logger.debug(`Ran ${promises.length} agents in ${timer.stop()}ms`);
  }

  public getAgentCount(): number {
    return this.agents.size;
  }

  public getRunningAgentCount(): number {
    return this.runningAgents.size;
  }

  public getAgentIds(): string[] {
    return Array.from(this.agents.keys());
  }

  public getRunningAgentIds(): string[] {
    return Array.from(this.runningAgents);
  }
}