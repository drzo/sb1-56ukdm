export class LockFreeQueue<T> {
  private items: T[];
  private head: number;
  private tail: number;
  private readonly capacity: number;

  constructor(capacity: number = 1000) {
    this.items = new Array(capacity);
    this.head = 0;
    this.tail = 0;
    this.capacity = capacity;
  }

  enqueue(item: T): boolean {
    if (this.isFull()) {
      return false;
    }

    this.items[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    return true;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    const item = this.items[this.head];
    this.head = (this.head + 1) % this.capacity;
    return item;
  }

  peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[this.head];
  }

  isEmpty(): boolean {
    return this.head === this.tail;
  }

  isFull(): boolean {
    return (this.tail + 1) % this.capacity === this.head;
  }

  size(): number {
    if (this.tail >= this.head) {
      return this.tail - this.head;
    }
    return this.capacity - (this.head - this.tail);
  }

  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.items = new Array(this.capacity);
  }
}