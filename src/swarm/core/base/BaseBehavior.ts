import { SwarmPolicy } from '../../types';
import { Logger } from '../../../cogutil/Logger';

export abstract class BaseBehavior {
  protected name: string;
  protected policies: Map<string, SwarmPolicy>;
  protected active: boolean;

  constructor(name: string) {
    this.name = name;
    this.policies = new Map();
    this.active = false;
    Logger.info(`Behavior ${name} initialized`);
  }

  getName(): string {
    return this.name;
  }

  isActive(): boolean {
    return this.active;
  }

  addPolicy(policy: SwarmPolicy): void {
    this.policies.set(policy.name, policy);
  }

  removePolicy(name: string): boolean {
    return this.policies.delete(name);
  }

  getPolicies(): SwarmPolicy[] {
    return Array.from(this.policies.values());
  }

  abstract evaluate(context: any): Promise<boolean>;
  abstract execute(context: any): Promise<void>;
}