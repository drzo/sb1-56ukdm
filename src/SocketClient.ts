import { io, Socket } from 'socket.io-client';
import { Logger } from '../cogutil/Logger';

export class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;

  private constructor() {
    this.setupSocket();
  }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  private setupSocket(): void {
    try {
      this.socket = io('/', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
        autoConnect: true,
        path: '/socket.io'
      });

      this.socket.on('connect', () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        Logger.info('Connected to server');
      });

      this.socket.on('disconnect', (reason) => {
        this.connected = false;
        Logger.warn(`Disconnected from server: ${reason}`);
      });

      this.socket.on('connect_error', (error) => {
        this.reconnectAttempts++;
        Logger.error('Connection error:', error);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.socket?.close();
          Logger.error('Max reconnection attempts reached');
        }
      });

      // Setup ping/pong for connection health check
      setInterval(() => {
        if (this.socket?.connected) {
          this.socket.emit('ping');
        }
      }, 30000);

      this.socket.on('pong', () => {
        Logger.debug('Server responded to ping');
      });

    } catch (error) {
      Logger.error('Failed to setup socket:', error);
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async emit(event: string, data: any): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket is not connected');
    }

    try {
      this.socket.emit(event, data);
    } catch (error) {
      Logger.error(`Failed to emit ${event}:`, error);
      throw error;
    }
  }

  public on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  public off(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
    }
  }
}