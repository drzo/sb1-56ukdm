export class Hash {
  private static readonly FNV_PRIME = 16777619;
  private static readonly FNV_OFFSET_BASIS = 2166136261;

  static fnv1a(data: string): number {
    let hash = Hash.FNV_OFFSET_BASIS;
    for (let i = 0; i < data.length; i++) {
      hash ^= data.charCodeAt(i);
      hash *= Hash.FNV_PRIME;
    }
    return hash >>> 0;
  }

  static murmur3(data: string, seed: number = 0): number {
    const remainder = data.length & 3;
    const bytes = data.length - remainder;
    let h1 = seed;
    let k1: number;
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;

    for (let i = 0; i < bytes; i += 4) {
      k1 = ((data.charCodeAt(i) & 0xff)) |
        ((data.charCodeAt(i + 1) & 0xff) << 8) |
        ((data.charCodeAt(i + 2) & 0xff) << 16) |
        ((data.charCodeAt(i + 3) & 0xff) << 24);

      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);

      h1 ^= k1;
      h1 = (h1 << 13) | (h1 >>> 19);
      h1 = Math.imul(h1, 5) + 0xe6546b64;
    }

    k1 = 0;
    switch (remainder) {
      case 3:
        k1 ^= (data.charCodeAt(bytes + 2) & 0xff) << 16;
      case 2:
        k1 ^= (data.charCodeAt(bytes + 1) & 0xff) << 8;
      case 1:
        k1 ^= (data.charCodeAt(bytes) & 0xff);
        k1 = Math.imul(k1, c1);
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = Math.imul(k1, c2);
        h1 ^= k1;
    }

    h1 ^= data.length;
    h1 ^= h1 >>> 16;
    h1 = Math.imul(h1, 0x85ebca6b);
    h1 ^= h1 >>> 13;
    h1 = Math.imul(h1, 0xc2b2ae35);
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
  }

  static combine(...hashes: number[]): number {
    return hashes.reduce((combined, hash) => {
      combined = ((combined << 5) + combined) + hash;
      return combined & combined;
    }, 0);
  }
}