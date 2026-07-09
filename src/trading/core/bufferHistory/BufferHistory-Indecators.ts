import { Candle } from "../models/Candle";

/**
 * Fixed-size circular buffer for history of any item type.
 *
 * Characteristics:
 * - O(1) push
 * - O(1) random access
 * - Fixed memory usage
 * - Automatically overwrites the oldest item when full
 *
 * Defaults to `Candle` for backward compatibility with existing
 * `new HistoryBuffer(50)` call sites; pass a type param explicitly
 * to store richer rows, e.g. `new HistoryBuffer<CandleRow>(50)`.
 */
export class HistoryBuffer<T = Candle> {
  private readonly buffer: T[];

  /** Maximum number of items */
  private readonly maxSize: number;

  /** Index of the oldest item */
  private head = 0;

  /** Number of items currently stored */
  private length = 0;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error(
        "HistoryBuffer capacity must be a positive integer."
      );
    }

    this.maxSize = capacity;
    this.buffer = new Array<T>(capacity);
  }

  /**
   * Add a new item.
   *
   * If the buffer is full,
   * the oldest item is overwritten.
   */
  push(item: T): void {
    const tail = (this.head + this.length) % this.maxSize;

    this.buffer[tail] = item;

    if (this.length < this.maxSize) {
      this.length++;
    } else {
      this.head = (this.head + 1) % this.maxSize;
    }
  }

  /**
   * Remove all items.
   */
  clear(): void {
    this.head = 0;
    this.length = 0;
  }

  get size(): number {
    return this.length;
  }

  get capacity(): number {
    return this.maxSize;
  }

  get isFull(): boolean {
    return this.length === this.maxSize;
  }

  /**
   * Returns the oldest item.
   */
  get oldest(): T | null {
    if (this.length === 0) {
      return null;
    }

    return this.buffer[this.head];
  }

  /**
   * Returns the newest item.
   */
  get latest(): T | null {
    if (this.length === 0) {
      return null;
    }

    const index = (this.head + this.length - 1) % this.maxSize;

    return this.buffer[index];
  }

  has(count: number): boolean {
    return this.length >= count;
  }

  /**
   * Chronological access.
   *
   * at(0) => oldest
   * at(size - 1) => newest
   */
  at(index: number): T | null {
    if (index < 0 || index >= this.length) {
      return null;
    }

    return this.buffer[(this.head + index) % this.maxSize];
  }

  /**
   * Reverse chronological access.
   *
   * get(0) => newest
   * get(1) => previous item
   * get(2) => two items ago
   */
  get(offset: number): T | null {
    if (offset < 0 || offset >= this.length) {
      return null;
    }

    const index =
      (this.head + this.length - 1 - offset + this.maxSize) % this.maxSize;

    return this.buffer[index];
  }
}
