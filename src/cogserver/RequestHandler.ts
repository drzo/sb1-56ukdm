import { AtomSpaceProvider } from '../atomspace/core/AtomSpaceProvider';
import { Logger } from '../cogutil/Logger';
import { Timer } from '../cogutil/Timer';

export interface CogServerRequest {
  type: string;
  data: any;
  requestId: string;
}

export class RequestHandler {
  private atomspace = AtomSpaceProvider.getInstance().getAtomSpace();
  private handlers: Map<string, (data: any) => Promise<any>>;

  constructor() {
    this.handlers = new Map();
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers(): void {
    this.handlers.set('getAtom', async (data) => {
      return this.atomspace.getAtom(data.id);
    });

    this.handlers.set('addNode', async (data) => {
      return this.atomspace.addNode(data.type, data.name, data.truthValue);
    });

    this.handlers.set('addLink', async (data) => {
      const outgoing = await Promise.all(
        data.outgoing.map((id: string) => this.atomspace.getAtom(id))
      );
      return this.atomspace.addLink(data.type, outgoing, data.truthValue);
    });

    this.handlers.set('removeAtom', async (data) => {
      return this.atomspace.removeAtom(data.id);
    });

    this.handlers.set('getAtomsByType', async (data) => {
      return this.atomspace.getAtomsByType(data.type);
    });
  }

  public registerHandler(type: string, handler: (data: any) => Promise<any>): void {
    this.handlers.set(type, handler);
    Logger.info(`Registered handler for request type: ${type}`);
  }

  public async handleRequest(request: CogServerRequest): Promise<any> {
    const timer = new Timer();
    const handler = this.handlers.get(request.type);

    if (!handler) {
      Logger.error(`No handler found for request type: ${request.type}`);
      throw new Error(`Unsupported request type: ${request.type}`);
    }

    try {
      const result = await handler(request.data);
      Logger.debug(`Request ${request.type} handled in ${timer.stop()}ms`);
      return result;
    } catch (error) {
      Logger.error(`Error handling request ${request.type}:`, error);
      throw error;
    }
  }
}