import { Candle } from "../models/Candle";

/**
 * Sequential source of completed candles.
 *
 * A Feed is responsible only for supplying candles
 * in chronological order.
 *
 * Implementations may read data from:
 * - CSV
 * - MT5 Broker
 * - Database
 * - Memory
 * - Replay
 *
 * The Feed must never:
 * - calculate indicators
 * - generate signals
 * - execute trades
 *
 * Lifecycle:
 *
 *   open()
 *      ↓
 *   next()
 *      ↓
 *   next()
 *      ↓
 *   ...
 *      ↓
 *   close()
 */
export interface Feed {
  /**
   * Opens the data source.
   *
   * Must be called before next().
   *
   * Calling open() multiple times should have no side effects.
   */
  open(): Promise<void>;

  /**
   * Releases all resources.
   *
   * Safe to call multiple times.
   */
  close(): Promise<void>;

  /**
   * Restart reading from the beginning.
   *
   * Keeps the feed opened.
   */
  reset(): Promise<void>;

  /**
   * Returns the next completed candle.
   *
   * Returns:
   * - Candle : next candle
   * - null   : end of data
   */
  next(): Promise<Candle | null>;

  /**
   * Returns the latest candle returned by next().
   *
   * Returns null before the first candle.
   */
  current(): Candle | null;
}