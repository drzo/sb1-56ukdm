import { io, Socket } from 'socket.io-client';

export class PythonBridge {
  private socket: Socket | null = null;
  private messageQueue: Map<string, { resolve: Function, reject: Function }> = new Map();

  constructor(private url: string = 'http://localhost:3000') {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.url);
      
      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve();
      });
      
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        reject(error);
      });
      
      this.socket.on('response', (response) => {
        const handler = this.messageQueue.get(response.requestId);
        if (handler) {
          if (response.status === 'success') {
            handler.resolve(response.data);
          } else {
            handler.reject(new Error(response.message));
          }
          this.messageQueue.delete(response.requestId);
        }
      });
    });
  }

  async sendCommand(command: string, params: any = {}): Promise<any> {
    if (!this.socket?.connected) {
      throw new Error('Socket is not connected');
    }

    const requestId = Math.random().toString(36).substring(7);
    
    return new Promise((resolve, reject) => {
      this.messageQueue.set(requestId, { resolve, reject });
      
      this.socket!.emit('command', {
        command,
        params,
        requestId
      });
    });
  }

  async hyperonQuery(command: string, data: any = {}): Promise<any> {
    return this.sendCommand('hyperon_query', { command, data });
  }

  async minecraftAction(action: any): Promise<any> {
    return this.sendCommand('minecraft_action', { action });
  }

  async mosesCrossval(dataset: any, target: string): Promise<any> {
    return this.sendCommand('moses_crossval', { dataset, target });
  }

  async mevisUpdate(atoms: any[]): Promise<any> {
    return this.sendCommand('mevis_update', { atoms });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}