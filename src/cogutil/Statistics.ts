import { create, all } from 'mathjs';
const math = create(all);

export class Statistics {
  public static mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  public static variance(values: number[]): number {
    if (values.length < 2) return 0;
    const avg = this.mean(values);
    return values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / (values.length - 1);
  }

  public static standardDeviation(values: number[]): number {
    return Math.sqrt(this.variance(values));
  }

  public static correlation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const meanX = this.mean(x);
    const meanY = this.mean(y);
    const stdDevX = this.standardDeviation(x);
    const stdDevY = this.standardDeviation(y);

    if (stdDevX === 0 || stdDevY === 0) return 0;

    let sum = 0;
    for (let i = 0; i < x.length; i++) {
      sum += ((x[i] - meanX) * (y[i] - meanY));
    }

    return sum / ((x.length - 1) * stdDevX * stdDevY);
  }

  public static entropy(probabilities: number[]): number {
    return -probabilities.reduce((sum, p) => {
      if (p <= 0) return sum;
      return sum + p * Math.log2(p);
    }, 0);
  }

  public static kld(p: number[], q: number[]): number {
    if (p.length !== q.length) throw new Error('Distributions must have same length');
    
    return p.reduce((sum, pi, i) => {
      if (pi <= 0 || q[i] <= 0) return sum;
      return sum + pi * Math.log2(pi / q[i]);
    }, 0);
  }

  public static factorial(n: number): number {
    if (n < 0) throw new Error('Factorial not defined for negative numbers');
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  public static combinations(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
  }
}