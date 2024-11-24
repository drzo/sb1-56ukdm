export class Config {
  private static instance: Config;
  private config: Map<string, any>;

  private constructor() {
    this.config = new Map();
    this.loadDefaults();
  }

  private loadDefaults(): void {
    const defaults = {
      'logger.level': 'info',
      'atomspace.max_nodes': 1000000,
      'atomspace.max_links': 5000000,
      'atomspace.index_type': 'hash',
      'atomspace.cache_size': 10000,
      'atomspace.gc_interval': 60000,
      'atomspace.truth_value.default_strength': 1.0,
      'atomspace.truth_value.default_confidence': 1.0
    };

    Object.entries(defaults).forEach(([key, value]) => {
      this.config.set(key, value);
    });
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public get(key: string): any {
    return this.config.get(key);
  }

  public set(key: string, value: any): void {
    this.config.set(key, value);
  }

  public has(key: string): boolean {
    return this.config.has(key);
  }

  public loadFromJSON(json: Record<string, any>): void {
    Object.entries(json).forEach(([key, value]) => {
      this.config.set(key, value);
    });
  }

  public toJSON(): Record<string, any> {
    return Object.fromEntries(this.config);
  }
}