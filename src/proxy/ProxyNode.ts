import { Node } from '../types/Node';
import { NodeType } from '../types/AtomTypes';
import { Logger } from '../cogutil/Logger';
import { Timer } from '../cogutil/Timer';
import { AtomicCounter } from '../cogutil/concurrent/AtomicCounter';

export class ProxyNode extends Node {
  private static counter = new AtomicCounter();
  private target: Node | null = null;
  private lastAccessTime: number = Date.now();
  private accessCount: number = 0;
  private routingTable: Map<string, Node> = new Map();

  constructor(name: string) {
    super(NodeType.PROXY, name);
    this.id = `proxy-${ProxyNode.counter.increment()}`;
  }

  setTarget(node: Node): void {
    this.target = node;
    this.lastAccessTime = Date.now();
    Logger.debug(`Set target for proxy ${this.id} to ${node.getId()}`);
  }

  getTarget(): Node | null {
    if (this.target) {
      this.accessCount++;
      this.lastAccessTime = Date.now();
    }
    return this.target;
  }

  addRoute(key: string, node: Node): void {
    this.routingTable.set(key, node);
    Logger.debug(`Added route ${key} for proxy ${this.id}`);
  }

  removeRoute(key: string): void {
    this.routingTable.delete(key);
    Logger.debug(`Removed route ${key} from proxy ${this.id}`);
  }

  route(key: string): Node | null {
    const node = this.routingTable.get(key);
    if (node) {
      this.accessCount++;
      this.lastAccessTime = Date.now();
      return node;
    }
    return null;
  }

  getAccessStats(): {
    lastAccess: number;
    accessCount: number;
    routeCount: number;
  } {
    return {
      lastAccess: this.lastAccessTime,
      accessCount: this.accessCount,
      routeCount: this.routingTable.size
    };
  }

  clearRoutes(): void {
    this.routingTable.clear();
    Logger.debug(`Cleared all routes for proxy ${this.id}`);
  }
}