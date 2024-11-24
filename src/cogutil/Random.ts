export class Random {
  private static seed: number = Date.now();

  public static setSeed(seed: number): void {
    this.seed = seed;
  }

  public static randint(min: number, max: number): number {
    const x = Math.sin(this.seed++) * 10000;
    const rand = x - Math.floor(x);
    return Math.floor(rand * (max - min + 1)) + min;
  }

  public static randfloat(min: number = 0, max: number = 1): number {
    const x = Math.sin(this.seed++) * 10000;
    const rand = x - Math.floor(x);
    return rand * (max - min) + min;
  }

  public static randselect<T>(array: T[]): T {
    const index = this.randint(0, array.length - 1);
    return array[index];
  }

  public static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.randint(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public static randomBool(probability: number = 0.5): boolean {
    return this.randfloat() < probability;
  }
}