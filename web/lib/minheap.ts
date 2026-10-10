// Binary min-heap mirroring MinHeap.java: parallel key/value arrays, lazy
// Dijkstra insertion, bubble-up on insert and bubble-down on extract.
// Every mutation can report an event so the 3D heap can animate the real steps.

export interface HeapItem {
  id: number; // stable identity so the scene can animate an item between slots
  key: string;
  value: number;
}

export type HeapEvent =
  | { type: 'insert'; item: HeapItem; index: number }
  | { type: 'swap'; i: number; j: number; label: string }
  | { type: 'extract'; item: HeapItem }
  | { type: 'settle'; index: number };

export class MinHeap {
  private items: HeapItem[] = [];
  private nextId = 1;

  constructor(private onEvent?: (e: HeapEvent, snapshot: HeapItem[]) => void) {}

  /** Seed the heap without recording events (used to set up a demo state). */
  static fromValues(
    values: number[],
    onEvent?: (e: HeapEvent, snapshot: HeapItem[]) => void,
  ): MinHeap {
    const heap = new MinHeap(onEvent);
    values.forEach((v, idx) => heap.items.push({ id: heap.nextId++, key: `n${idx}`, value: v }));
    return heap;
  }

  get size(): number {
    return this.items.length;
  }

  snapshot(): HeapItem[] {
    return this.items.map((it) => ({ ...it }));
  }

  insert(key: string, value: number): void {
    const item: HeapItem = { id: this.nextId++, key, value };
    this.items.push(item);
    const index = this.items.length - 1;
    this.emit({ type: 'insert', item: { ...item }, index });
    this.bubbleUp(index);
  }

  extractMin(): HeapItem | null {
    if (this.items.length === 0) return null;
    const min = this.items[0];
    const last = this.items.pop() as HeapItem;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    this.emit({ type: 'extract', item: { ...min } });
    return min;
  }

  private bubbleUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.items[parent].value <= this.items[i].value) break;
      this.swap(i, parent, 'bubble up');
      i = parent;
    }
  }

  private bubbleDown(index: number): void {
    let i = index;
    for (;;) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < this.items.length && this.items[left].value < this.items[smallest].value) smallest = left;
      if (right < this.items.length && this.items[right].value < this.items[smallest].value) smallest = right;
      if (smallest === i) break;
      this.swap(i, smallest, 'bubble down');
      i = smallest;
    }
  }

  private swap(i: number, j: number, label: string): void {
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    this.emit({ type: 'swap', i, j, label });
  }

  private emit(e: HeapEvent): void {
    this.onEvent?.(e, this.snapshot());
  }
}
