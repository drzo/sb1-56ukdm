export class AtomicCounter {
  private value: number;

  constructor(initialValue: number = 0) {
    this.value = initialValue;
  }

  increment(): number {
    return ++this.value;
  }

  decrement(): number {
    return --this.value;
  }

  add(delta: number): number {
    return (this.value += delta);
  }

  subtract(delta: number): number {
    return (this.value -= delta);
  }

  get(): number {
    return this.value;
  }

  set(newValue: number): void {
    this.value = newValue;
  }

  compareAndSet(expected: number, newValue: number): boolean {
    if (this.value === expected) {
      this.value = newValue;
      return true;
    }
    return false;
  }
}