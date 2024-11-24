import { Pattern, MinedPattern } from '../../../types';
import { MiningConfig } from '../core/mining-controller';
import { PatternValidator } from './pattern-validator';
import { MiningConfigValidator } from './mining-config-validator';

export class MiningValidator {
  private patternValidator: PatternValidator;
  private configValidator: MiningConfigValidator;

  constructor() {
    this.patternValidator = new PatternValidator();
    this.configValidator = new MiningConfigValidator();
  }

  validatePattern(pattern: Pattern): boolean {
    return this.patternValidator.validate(pattern);
  }

  validateConfig(config: Partial<MiningConfig>): boolean {
    return this.configValidator.validate(config);
  }

  validateMinedPattern(pattern: MinedPattern, config: MiningConfig): boolean {
    return this.validatePattern(pattern.pattern) &&
           this.validateMetrics(pattern, config);
  }

  private validateMetrics(pattern: MinedPattern, config: MiningConfig): boolean {
    return pattern.support >= config.minSupport &&
           pattern.confidence >= config.minConfidence &&
           pattern.interestingness >= 0 &&
           pattern.interestingness <= 1;
  }
}