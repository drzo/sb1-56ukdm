import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WeakRefCache } from '../../../cogutil/memory/WeakRefCache';

describe('WeakRefCache', () => {
  let cache: WeakRefCache<string, object>;

  beforeEach(() => {
    cache = new WeakRefCache(1000);
  });

  afterEach(() => {
    cache.dispose();
  });

  it('should store and retrieve values', () => {
    const obj = { data: 'test' };
    cache.set('key1', obj);
    expect(cache.get('key1')).toBe(obj);
  });

  it('should check existence of keys', () => {
    const obj = { data: 'test' };
    cache.set('key1', obj);
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should delete values', () => {
    const obj = { data: 'test' };
    cache.set('key1', obj);
    expect(cache.delete('key1')).toBe(true);
    expect(cache.has('key1')).toBe(false);
  });

  it('should clear all values', () => {
    cache.set('key1', { data: 'test1' });
    cache.set('key2', { data: 'test2' });
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it('should track size correctly', () => {
    cache.set('key1', { data: 'test1' });
    cache.set('key2', { data: 'test2' });
    expect(cache.size()).toBe(2);
    cache.delete('key1');
    expect(cache.size()).toBe(1);
  });
});