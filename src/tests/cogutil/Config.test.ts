import { describe, it, expect } from 'vitest';
import { Config } from '../../cogutil/Config';

describe('Config', () => {
  it('should maintain singleton instance', () => {
    const config1 = Config.getInstance();
    const config2 = Config.getInstance();
    expect(config1).toBe(config2);
  });

  it('should store and retrieve values', () => {
    const config = Config.getInstance();
    config.set('test.key', 'test-value');
    expect(config.get('test.key')).toBe('test-value');
  });

  it('should check if key exists', () => {
    const config = Config.getInstance();
    config.set('exists.key', 'value');
    expect(config.has('exists.key')).toBe(true);
    expect(config.has('nonexistent.key')).toBe(false);
  });

  it('should load from JSON', () => {
    const config = Config.getInstance();
    const testConfig = {
      'test.setting1': 'value1',
      'test.setting2': 42
    };
    
    config.loadFromJSON(testConfig);
    expect(config.get('test.setting1')).toBe('value1');
    expect(config.get('test.setting2')).toBe(42);
  });

  it('should export to JSON', () => {
    const config = Config.getInstance();
    config.set('export.key1', 'value1');
    config.set('export.key2', 'value2');
    
    const json = config.toJSON();
    expect(json['export.key1']).toBe('value1');
    expect(json['export.key2']).toBe('value2');
  });

  it('should maintain default values', () => {
    const config = Config.getInstance();
    expect(config.get('logger.level')).toBe('info');
    expect(config.get('atomspace.max_nodes')).toBe(1000000);
  });
});