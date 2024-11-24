import { format } from 'date-fns';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: any;
}

export class Logger {
  private static level: LogLevel = 'info';
  private static readonly levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4
  };

  private static shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.level];
  }

  private static formatMessage(level: LogLevel, message: string, metadata?: any): LogMessage {
    return {
      level,
      message,
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      metadata
    };
  }

  private static log(level: LogLevel, message: string, metadata?: any): void {
    if (!this.shouldLog(level)) return;

    const logMessage = this.formatMessage(level, message, metadata);
    const style = this.getLogStyle(level);
    
    console[level === 'debug' ? 'log' : level](
      `%c${logMessage.timestamp} [${level.toUpperCase()}] ${message}`,
      style,
      metadata ? `\n${JSON.stringify(metadata, null, 2)}` : ''
    );
  }

  private static getLogStyle(level: LogLevel): string {
    const styles = {
      error: 'color: #ff0000; font-weight: bold;',
      warn: 'color: #ffa500; font-weight: bold;',
      info: 'color: #00ff00;',
      debug: 'color: #808080;',
      trace: 'color: #808080; font-style: italic;'
    };
    return styles[level];
  }

  static setLevel(level: LogLevel): void {
    this.level = level;
  }

  static error(message: string, error?: any): void {
    this.log('error', message, error);
  }

  static warn(message: string, metadata?: any): void {
    this.log('warn', message, metadata);
  }

  static info(message: string, metadata?: any): void {
    this.log('info', message, metadata);
  }

  static debug(message: string, metadata?: any): void {
    this.log('debug', message, metadata);
  }

  static trace(message: string, metadata?: any): void {
    this.log('trace', message, metadata);
  }
}