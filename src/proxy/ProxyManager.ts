import { ProxyNode } from './ProxyNode';
import { Node } from '../types/Node';
import { Logger } from '../cogutil/Logger';
import { Timer } from '../cogutil/Timer';
import { LockFreeQueue } from '../cogutil/concurrent/LockFreeQueue';

export class ProxyManager {
  private static instance: ProxyManager;
  private proxies: Map<string, ProxyNode> = new Map();
  private routingQueue: LockFreeQueue<{
    proxyId: string;
    targetId: string;
    action: 'add' | 'remove';
  }>;

  private constructor() {
    this.routingQueue = new LockFreeQueue(1000);
    this.startRoutingProcessor();
    Logger.info('ProxyManager initialized');
  }

  public static getInstance(): ProxyManager {
    if (!ProxyManager.instance) {
      ProxyManager.instance = new ProxyManager();
    }
    return ProxyManager.instance;
  }

  createProxy(name: string): ProxyNode {
    const proxy = new ProxyNode(name);
    this.proxies.set(proxy.getId(), proxy);
    Logger.info(`Created proxy: ${proxy.getId()}`);
    return proxy;
  }

  getProxy(id: string): ProxyNode | undefined {
    return this.proxies.get(id);
  }

  removeProxy(id: string): void {
    const proxy = this.proxies.get(id);
    if (proxy) {
      proxy.clearRoutes();
      this.proxies.delete(id);
      Logger.info(`Removed proxy: ${id}`);
    }
  }

  async routeNode(proxyId: string, node: Node): Promise<void> {
    const proxy = this.proxies.get(proxyId);
    if (!proxy) {
      throw new Error(`Proxy not found: ${proxyId}`);
    }

    this.routingQueue.enqueue({
      proxyId,
      targetId: node.getId(),
      action: 'add'
    });
  }

  private async startRoutingProcessor(): Promise<void> {
    while (true) {
      const request = this.routingQueue.dequeue();
      if (request) {
        const proxy = this.proxies.get(request.proxyId);
        if (proxy) {
          try {
            if (request.action === 'add') {
              proxy.addRoute(request.targetId, new Node(proxy.getType(), request.targetId));
            } else {
              proxy.removeRoute(request.targetId);
            }
          } catch (error) {
            Logger.error('Error processing routing request:', error);
          }
        }
      }
      await Timer.sleep(10);
    }
  }

  getProxyStats(): Map<string, {
    lastAccess: number;
    accessCount: number;
    routeCount: number;
  }> {
    const stats = new Map();
    for (const [id, proxy] of this.proxies) {
      stats.set(id, proxy.getAccessStats());
    }
    return stats;
  }

  cleanup(): void {
    const now = Date.now();
    const staleTimeout = 30 * 60 * 1000; // 30 minutes

    for (const [id, proxy] of this.proxies) {
      const stats = proxy.getAccessStats();
      if (now - stats.lastAccess > staleTimeout) {
        this.removeProxy(id);
      }
    }
  }
}