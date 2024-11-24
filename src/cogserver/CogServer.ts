import { Server } from 'socket.io';
import { createServer } from 'http';
import { AtomSpaceProvider } from '../atomspace/core/AtomSpaceProvider';
import { Logger } from '../cogutil/Logger';
import { Timer } from '../cogutil/Timer';
import { CogModule } from './CogModule';
import { RequestHandler } from './RequestHandler';
import { AgentRegistry } from './AgentRegistry';

export class CogServer {
  private static instance: CogServer | null = null;
  private io: Server;
  private modules: Map<string, CogModule>;
  private requestHandler: RequestHandler;
  private agentRegistry: AgentRegistry;
  private running: boolean = false;
  private cycleCount: number = 0;

  private constructor() {
    const httpServer = createServer();
    this.io = new Server(httpServer, {
      cors: { origin: "*" }
    });

    this.modules = new Map();
    this.requestHandler = new RequestHandler();
    this.agentRegistry = new AgentRegistry();

    Logger.info('CogServer initialized');
  }

  public static getInstance(): CogServer {
    if (!CogServer.instance) {
      CogServer.instance = new CogServer();
    }
    return CogServer.instance;
  }

  public start(port: number = 3000): void {
    if (this.running) {
      Logger.warn('CogServer already running');
      return;
    }

    try {
      this.setupSocketHandlers();
      this.io.listen(port);
      this.running = true;
      this.startMainLoop();
      Logger.info(`CogServer started on port ${port}`);
    } catch (error) {
      Logger.error('Failed to start CogServer:', error);
      throw error;
    }
  }

  public stop(): void {
    if (!this.running) return;

    try {
      this.running = false;
      this.io.close();
      Logger.info('CogServer stopped');
    } catch (error) {
      Logger.error('Error stopping CogServer:', error);
      throw error;
    }
  }

  public registerModule(module: CogModule): void {
    if (this.modules.has(module.getId())) {
      Logger.warn(`Module ${module.getId()} already registered`);
      return;
    }

    this.modules.set(module.getId(), module);
    Logger.info(`Registered module: ${module.getId()}`);
  }

  public unregisterModule(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (module) {
      module.cleanup();
      this.modules.delete(moduleId);
      Logger.info(`Unregistered module: ${moduleId}`);
    }
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      Logger.info(`Client connected: ${socket.id}`);

      socket.on('request', async (data) => {
        const timer = new Timer();
        try {
          const response = await this.requestHandler.handleRequest(data);
          socket.emit('response', {
            success: true,
            data: response,
            executionTime: timer.stop()
          });
        } catch (error) {
          Logger.error('Error handling request:', error);
          socket.emit('response', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime: timer.stop()
          });
        }
      });

      socket.on('disconnect', () => {
        Logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  private async startMainLoop(): Promise<void> {
    while (this.running) {
      const timer = new Timer();
      
      try {
        // Run all active modules
        for (const module of this.modules.values()) {
          if (module.isEnabled()) {
            await module.run();
          }
        }

        // Run all scheduled agents
        await this.agentRegistry.runActiveAgents();

        this.cycleCount++;
        
        if (this.cycleCount % 100 === 0) {
          Logger.debug(`CogServer cycle ${this.cycleCount} completed in ${timer.stop()}ms`);
        }

        // Small delay to prevent CPU hogging
        await Timer.sleep(10);
      } catch (error) {
        Logger.error('Error in CogServer main loop:', error);
        await Timer.sleep(1000); // Longer delay on error
      }
    }
  }

  public getCycleCount(): number {
    return this.cycleCount;
  }

  public getModuleCount(): number {
    return this.modules.size;
  }

  public getActiveModules(): string[] {
    return Array.from(this.modules.values())
      .filter(m => m.isEnabled())
      .map(m => m.getId());
  }
}