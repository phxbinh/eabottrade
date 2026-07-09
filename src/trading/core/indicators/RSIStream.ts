// Wilder's Smooth
export class RSIStream {
  private readonly period: number;
  private prevClose: number | null = null;
  private count = 0;
  private sumGain = 0;
  private sumLoss = 0;
  private avgGain = 0;
  private avgLoss = 0;
  private ready = false;
  private currentValue: number | null = null;

  constructor(period: number = 14) {
    this.period = period;
  }

  get value(): number | null {
    return this.currentValue;
  }

  update(close: number): number | null {
    if (this.prevClose === null) {
      this.prevClose = close;
      return null;
    }

    const change = close - this.prevClose;
    this.prevClose = close;

    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    if (!this.ready) {
      this.sumGain += gain;
      this.sumLoss += loss;
      this.count++;

      if (this.count === this.period) {
        this.avgGain = this.sumGain / this.period;
        this.avgLoss = this.sumLoss / this.period;
        this.ready = true;
        this.currentValue = this.computeRSI();
      }

      return this.currentValue;
    }

    this.avgGain = (this.avgGain * (this.period - 1) + gain) / this.period;
    this.avgLoss = (this.avgLoss * (this.period - 1) + loss) / this.period;

    this.currentValue = this.computeRSI();
    return this.currentValue;
  }

  private computeRSI(): number {
    if (this.avgLoss === 0) return 100;
    const rs = this.avgGain / this.avgLoss;
    return 100 - 100 / (1 + rs);
  }
}
