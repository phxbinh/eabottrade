import { EMAStream } from "./EMAStream";

export interface MACDPoint {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export class MACDStream {
  private readonly fastEMA: EMAStream;
  private readonly slowEMA: EMAStream;
  private readonly signalEMA: EMAStream;

  constructor(
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ) {
    this.fastEMA = new EMAStream(fastPeriod);
    this.slowEMA = new EMAStream(slowPeriod);
    this.signalEMA = new EMAStream(signalPeriod);
  }

  update(close: number): MACDPoint {
    const fast = this.fastEMA.update(close);
    const slow = this.slowEMA.update(close);

    if (fast === null || slow === null) {
      return { macd: null, signal: null, histogram: null };
    }

    const macd = fast - slow;
    const signal = this.signalEMA.update(macd);
    const histogram = signal !== null ? macd - signal : null;

    return { macd, signal, histogram };
  }
}
