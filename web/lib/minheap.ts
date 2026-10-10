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
