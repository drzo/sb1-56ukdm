import { describe, it, expect } from 'vitest';
import { Hash } from '../../cogutil/Hash';

describe('Hash', () => {
  it('should generate consistent FNV-1a hashes', () => {
    const input = 'test string';
    const hash1 = Hash.fnv1a(input);
    const hash2 = Hash.fnv1a(input);
    expect(hash1).toBe(hash2);
  });

  it('should generate different FNV-1a hashes for different inputs', () => {
    const hash1 = Hash.fnv1a('string1');
    const hash2 = Hash.fnv1a('string2');
    expect(hash1).not.toBe(hash2);
  });

  it('should generate consistent MurmurHash3 hashes with same seed', () => {
    const input = 'test string';
    const seed = 42;
    const hash1 = Hash.murmur3(input, seed);
    const hash2 = Hash.murmur3(input, seed);
    expect(hash1).toBe(hash2);
  });

  it('should generate different MurmurHash3 hashes with different seeds', () => {
    const input = 'test string';
    const hash1 = Hash.murmur3(input, 1);
    const hash2 = Hash.murmur3(input, 2);
    expect(hash1).not.toBe(hash2);
  });

  it('should combine multiple hashes', () => {
    const hash1 = Hash.fnv1a('string1');
    const hash2 = Hash.fnv1a('string2');
    const combined = Hash.combine(hash1, hash2);
    expect(combined).toBeDefined();
    expect(typeof combined).toBe('number');
  });
});