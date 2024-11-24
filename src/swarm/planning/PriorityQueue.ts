export class PriorityQueue<T> {
  private items: T[];
  private compare: (a: T, b: T) => number;

  constructor(compareFunction: (a: T, b: T) => number) {
    this.items = [];
    this.compare = compareFunction;
  }

  enqueue(item: T): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;

    const item = this.items[0];
    const last = this.items.pop()!;

    if (!this.isEmpty()) {
      this.items[0] = last;
      this.bubbleDown(0);
    }

    return item;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      if (this.compare(this.items[index], this.items[parentIndex]) <= 0) {
        break;
      }

      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let maxIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < this.items.length && 
          this.compare(this.items[leftChild], this.items[maxIndex]) > 0) {
        maxIndex = leftChild;
      }

      if (rightChild < this.items.length && 
          this.compare(this.items[rightChild], this.items[maxIndex]) > 0) {
        maxIndex = rightChild;
      }

      if (maxIndex === index) break;

      this.swap(index, maxIndex);
      index = maxIndex;
    }
  }

  private swap(i: number, j: number): void {
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
  }
}