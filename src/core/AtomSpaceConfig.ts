import { Config } from '../../cogutil/Config';
import { Logger } from '../../cogutil/Logger';

export class AtomSpaceConfig {
  static initialize(): void {
    try {
      const config = Config.getInstance();
      
      // Set default AtomSpace configuration if not already set
      const defaults = {
        'atomspace.max_nodes': 1000000,
        'atomspace.max_links': 5000000,
        'atomspace.index_type': 'hash',
        'atomspace.cache_size': 10000,
        'atomspace.gc_interval': 60000,
        'atomspace.truth_value.default_strength': 1.0,
        'atomspace.truth_value.default_confidence': 1.0,
        'atomspace.logger.level': 'info'
      };

      Object.entries(defaults).forEach(([key, value]) => {
        if (!config.has(key)) {
          config.set(key, value);
        }
      });

      Logger.info('AtomSpace configuration initialized', config.toJSON());
    } catch (error) {
      Logger.error('Failed to initialize AtomSpace configuration:', error);
      throw error;
    }
  }

  static getMaxNodes(): number {
    return Config.getInstance().get('atomspace.max_nodes');
  }

  static getMaxLinks(): number {
    return Config.getInstance().get('atomspace.max_links');
  }

  static getIndexType(): string {
    return Config.getInstance().get('atomspace.index_type');
  }

  static getCacheSize(): number {
    return Config.getInstance().get('atomspace.cache_size');
  }

  static getGCInterval(): number {
    return Config.getInstance().get('atomspace.gc_interval');
  }

  static getDefaultTruthValue(): { strength: number; confidence: number } {
    return {
      strength: Config.getInstance().get('atomspace.truth_value.default_strength'),
      confidence: Config.getInstance().get('atomspace.truth_value.default_confidence')
    };
  }
}