export interface Feed {
  next(): Promise<Candle | null>;

  reset(): Promise<void>;

  current(): Candle | null;
}