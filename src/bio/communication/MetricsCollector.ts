import { Logger } from '../../cogutil/Logger';

interface CommunicationMetrics {
  messageCount: number;
  averageProcessingTime: number;
  errorRate: number;
  signalStrength: number;
  successRate: number;
}

export class MetricsCollector {
  private metrics: CommunicationMetrics;
  private processingTimes: number[] = [];
  private readonly maxHistorySize = 1000;

  constructor() {
    this.metrics = {
      messageCount: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      signalStrength: 1,
      successRate: 1
    };
  }

  recordProcessingTime(time: number): void {
    this.processingTimes.push(time);
    if (this.processingTimes.length > this.maxHistorySize) {
      this.processingTimes.shift();
    }
    this.updateAverageProcessingTime();
  }

  recordMessage(success: boolean, signalStrength: number): void {
    this.metrics.messageCount++;
    this.metrics.signalStrength = 
      (this.metrics.signalStrength * 0.9) + (signalStrength * 0.1);
    
    const successRate = success ? 1 : 0;
    this.metrics.successRate = 
      (this.metrics.successRate * 0.9) + (successRate * 0.1);
    
    this.updateErrorRate();
  }

  private updateAverageProcessingTime(): void {
    if (this.processingTimes.length === 0) return;
    
    this.metrics.averageProcessingTime = 
      this.processingTimes.reduce((a, b) => a + b, 0) / 
      this.processingTimes.length;
  }

  private updateErrorRate(): void {
    this.metrics.errorRate = 1 - this.metrics.successRate;
  }

  getMetrics(): CommunicationMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.processingTimes = [];
    this.metrics = {
      messageCount: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      signalStrength: 1,
      successRate: 1
    };
  }
}