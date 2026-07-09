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
 */
export interface Feed {
  /**
   * Opens the data source.
   *
   * Must be called before next().
   */
  open(): Promise<void>;

  /**
   * Releases all resources.
   *
   * After close(), next() must throw.
   */
  close(): Promise<void>;

  /**
   * Restart reading from the beginning.
   */
  reset(): Promise<void>;

  /**
   * Returns the next completed candle.
   *
   * Returns null when no more candles exist.
   */
  next(): Promise<Candle | null>;

  /**
   * Returns the latest candle returned by next().
   *
   * Returns null before the first candle.
   */
  current(): Candle | null;
}