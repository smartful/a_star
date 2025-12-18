export class MinHeap<T> {
  private data: T[] = [];
  constructor(private less: (a: T, b: T) => boolean) {}

  private swap(i: number, j: number) {
    if (i === j) return;
    const a = this.data[i];
    const b = this.data[j];
    if (a === undefined || b === undefined) {
      throw new RangeError("swap indices out of bounds");
    }

    this.data[i] = b;
    this.data[j] = a;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      const currentNode = this.data[index];
      const parentNode = this.data[parent];
      if (currentNode === undefined || parentNode === undefined) {
        throw new RangeError("bubbleUp indices out of bounds");
      }

      if (!this.less(currentNode, parentNode)) break;

      this.swap(index, parent);
      index = parent;
    }
  }

  private bubbleDown(index: number) {
    const length = this.data.length;

    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < length) {
        const leftNode = this.data[left];
        const smallestNode = this.data[smallest];
        if (leftNode === undefined || smallestNode === undefined) {
          throw new RangeError("bubbleDown indices out of bounds");
        }
        if (this.less(leftNode, smallestNode)) {
          smallest = left;
        }
      }

      if (right < length) {
        const rightNode = this.data[right];
        const smallestNode = this.data[smallest];
        if (rightNode === undefined || smallestNode === undefined) {
          throw new RangeError("bubbleDown indices out of bounds");
        }
        if (this.less(rightNode, smallestNode)) {
          smallest = right;
        }
      }

      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  popMin(): T | undefined {
    if (this.data.length === 0) return undefined;
    if (this.data.length === 1) return this.data.pop();

    const min = this.data[0];
    this.data[0] = this.data.pop()!;
    this.bubbleDown(0);
    return min;
  }

  size() {
    return this.data.length;
  }

  peek(): T | undefined {
    return this.data[0];
  }

  push(value: T) {
    this.data.push(value);
    this.bubbleUp(this.data.length - 1);
  }
}
