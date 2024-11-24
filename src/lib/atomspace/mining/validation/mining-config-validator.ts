import { MiningConfig } from '../core/mining-controller';

export class MiningConfigValidator {
  static validate(config: Partial<MiningConfig>): boolean {
    return this.validateSupport(config.minSupport) &&
           this.validateConfidence(config.minConfidence) &&
           this.validateMaxPatterns(config.maxPatterns) &&
           this.validateMaxDepth(config.maxDepth);
  }

  private static validateSupport(support: number | undefined): boolean {
    if (support === undefined) return true;
    return typeof support === 'number' && support >= 0 && support <= 1;
  }

  private static validateConfidence(confidence: number | undefined): boolean {
    if (confidence === undefined) return true;
    return typeof confidence === 'number' && confidence >= 0 && confidence <= 1;
  }

  private static validateMaxPatterns(maxPatterns: number | undefined): boolean {
    if (maxPatterns === undefined) return true;
    return typeof maxPatterns === 'number' && maxPatterns > 0;
  }

  private static validateMaxDepth(maxDepth: number | undefined): boolean {
    if (maxDepth === undefined) return true;
    return typeof maxDepth === 'number' && maxDepth >= 0;
  }

  static getDefaultConfig(): MiningConfig {
    return {
      minSupport: 0.1,
      minConfidence: 0.5,
      maxPatterns: 100,
      maxDepth: 2
    };
  }
}