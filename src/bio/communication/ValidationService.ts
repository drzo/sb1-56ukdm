import { Logger } from '../../cogutil/Logger';
import { CommunicationContext } from './types';

export class ValidationService {
  private static readonly MAX_MESSAGE_LENGTH = 1024;
  private static readonly VALID_MESSAGE_TYPES = [
    'query',
    'response',
    'alert',
    'status'
  ];

  validateMessage(message: string): boolean {
    if (!message || message.length > ValidationService.MAX_MESSAGE_LENGTH) {
      Logger.warn('Invalid message length');
      return false;
    }
    return true;
  }

  validateContext(context: CommunicationContext): boolean {
    if (!context.sender || !context.receiver) {
      Logger.warn('Missing sender or receiver');
      return false;
    }

    if (!ValidationService.VALID_MESSAGE_TYPES.includes(context.messageType)) {
      Logger.warn('Invalid message type');
      return false;
    }

    if (context.signalStrength < 0 || context.signalStrength > 1) {
      Logger.warn('Invalid signal strength');
      return false;
    }

    return true;
  }

  validateSignalProcessing(signal: Float32Array): boolean {
    if (!signal || signal.length === 0) {
      Logger.warn('Invalid signal data');
      return false;
    }

    const validRange = signal.every(value => value >= 0 && value <= 1);
    if (!validRange) {
      Logger.warn('Signal values out of range');
      return false;
    }

    return true;
  }
}