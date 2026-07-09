/**
 * Represents one completed OHLCV candle.
 *
 * This is the fundamental immutable data model used throughout
 * the Trading Core.
 *
 * Rules:
 * - time is Unix Timestamp in milliseconds (UTC)
 * - high >= open, close, low
 * - low <= open, close, high
 * - volume >= 0
 */
export interface Candle {
  readonly time: number;

  readonly open: number;

  readonly high: number;

  readonly low: number;

  readonly close: number;

  readonly volume: number;
}