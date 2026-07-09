import { Candle } from "../models/Candle";

/**
 * Fixed-size circular buffer for Candle history.
 *
 * Characteristics:
 * - O(1) push
 * - O(1) random access
 * - Fixed memory usage
 * - Automatically overwrites the oldest candle when full
 */
export class HistoryBuffer {
  private readonly buffer: Candle[];

  /** Maximum number of candles */
  private readonly maxSize: number;

  /** Index of the oldest candle */
  private head = 0;

  /** Number of candles currently stored */
  private length = 0;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error(
        "HistoryBuffer capacity must be a positive integer."
      );
    }

    this.maxSize = capacity;
    this.buffer = new Array<Candle>(capacity);
  }

  /**
   * Add a new candle.
   *
   * If the buffer is full,
   * the oldest candle is overwritten.
   */
  push(candle: Candle): void {
    const tail = (this.head + this.length) % this.maxSize;

    this.buffer[tail] = candle;

    if (this.length < this.maxSize) {
      this.length++;
    } else {
      this.head = (this.head + 1) % this.maxSize;
    }
  }

  /**
   * Remove all candles.
   */
  clear(): void {
    this.head = 0;
    this.length = 0;
  }

  /**
   * Current number of candles.
   */
  get size(): number {
    return this.length;
  }

  /**
   * Maximum capacity.
   */
  get capacity(): number {
    return this.maxSize;
  }

  /**
   * Returns true if the buffer is full.
   */
  get isFull(): boolean {
    return this.length === this.maxSize;
  }

  /**
   * Returns the oldest candle.
   */
  get oldest(): Candle | null {
    if (this.length === 0) {
      return null;
    }

    return this.buffer[this.head];
  }

  /**
   * Returns the newest candle.
   */
  get latest(): Candle | null {
    if (this.length === 0) {
      return null;
    }

    const index =
      (this.head + this.length - 1) % this.maxSize;

    return this.buffer[index];
  }

  /**
   * Returns true if at least `count`
   * candles are available.
   */
  has(count: number): boolean {
    return this.length >= count;
  }

  /**
   * Chronological access.
   *
   * at(0) => oldest
   * at(size - 1) => newest
   */
  at(index: number): Candle | null {
    if (index < 0 || index >= this.length) {
      return null;
    }

    return this.buffer[
      (this.head + index) % this.maxSize
    ];
  }

  /**
   * Reverse chronological access.
   *
   * get(0) => newest
   * get(1) => previous candle
   * get(2) => two candles ago
   */
  get(offset: number): Candle | null {
    if (offset < 0 || offset >= this.length) {
      return null;
    }

    const index =
      (
        this.head +
        this.length -
        1 -
        offset +
        this.maxSize
      ) % this.maxSize;

    return this.buffer[index];
  }
}