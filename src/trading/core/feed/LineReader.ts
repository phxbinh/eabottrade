/**
 * Sequential text reader.
 *
 * Reads one text line at a time.
 *
 * Does NOT know:
 * - CSV
 * - Candle
 * - Trading
 */
export interface LineReader {
  /**
   * Opens the source.
   */
  open(): Promise<void>;

  /**
   * Releases all resources.
   */
  close(): Promise<void>;

  /**
   * Restart reading.
   */
  reset(): Promise<void>;

  /**
   * Returns next line.
   *
   * Returns null on EOF.
   */
  nextLine(): Promise<string | null>;
}