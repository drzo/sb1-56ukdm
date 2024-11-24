export class MemorySystem {
  constructor() {
    this.shortTerm = new Map();
    this.longTerm = new Map();
    this.capacity = 1000;
  }

  store(key, value, permanent = false) {
    if (permanent) {
      this.longTerm.set(key, {
        value,
        timestamp: Date.now()
      });
    } else {
      if (this.shortTerm.size >= this.capacity) {
        this.cleanup();
      }
      this.shortTerm.set(key, {
        value,
        timestamp: Date.now()
      });
    }
  }

  retrieve(key) {
    return this.shortTerm.get(key)?.value || this.longTerm.get(key)?.value;
  }

  cleanup() {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    
    for (const [key, entry] of this.shortTerm) {
      if (now - entry.timestamp > hour) {
        this.shortTerm.delete(key);
      }
    }
  }
}