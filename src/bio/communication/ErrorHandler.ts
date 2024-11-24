import { Logger } from '../../cogutil/Logger';

export enum ErrorType {
  PROCESSING = 'processing',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation'
}

export interface CommunicationError {
  type: ErrorType;
  message: string;
  timestamp: number;
  retryable: boolean;
  context?: any;
}

export class ErrorHandler {
  private static readonly MAX_ERROR_HISTORY = 100;
  private errorHistory: CommunicationError[] = [];

  logError(error: CommunicationError): void {
    this.errorHistory.push(error);
    if (this.errorHistory.length > ErrorHandler.MAX_ERROR_HISTORY) {
      this.errorHistory.shift();
    }
    Logger.error(`Communication error: ${error.type}`, error);
  }

  isRetryable(error: CommunicationError): boolean {
    return error.retryable && (
      error.type === ErrorType.NETWORK ||
      error.type === ErrorType.TIMEOUT
    );
  }

  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    retryableErrors: number;
  } {
    const stats = {
      totalErrors: this.errorHistory.length,
      errorsByType: {
        [ErrorType.PROCESSING]: 0,
        [ErrorType.NETWORK]: 0,
        [ErrorType.TIMEOUT]: 0,
        [ErrorType.VALIDATION]: 0
      },
      retryableErrors: 0
    };

    this.errorHistory.forEach(error => {
      stats.errorsByType[error.type]++;
      if (error.retryable) stats.retryableErrors++;
    });

    return stats;
  }

  clearHistory(): void {
    this.errorHistory = [];
  }
}