export interface ADXPoint {
  plusDI: number | null;
  minusDI: number | null;
  adx: number | null;
}

export class ADXStream {
  private readonly period: number;

  private prevHigh: number | null = null;
  private prevLow: number | null = null;
  private prevClose: number | null = null;

  // Tầng 1: smoothing TR, +DM, -DM
  private trCount = 0;
  private sumTR = 0;
  private sumPlusDM = 0;
  private sumMinusDM = 0;
  private avgTR = 0;
  private avgPlusDM = 0;
  private avgMinusDM = 0;
  private diReady = false;

  // Tầng 2: smoothing DX thành ADX
  private dxCount = 0;
  private sumDX = 0;
  private adxValue: number | null = null;
  private adxReady = false;

  constructor(period: number = 14) {
    this.period = period;
  }

  update(high: number, low: number, close: number): ADXPoint {
    if (
      this.prevHigh === null ||
      this.prevLow === null ||
      this.prevClose === null
    ) {
      this.prevHigh = high;
      this.prevLow = low;
      this.prevClose = close;
      return { plusDI: null, minusDI: null, adx: null };
    }

    const tr = Math.max(
      high - low,
      Math.abs(high - this.prevClose),
      Math.abs(low - this.prevClose)
    );

    const upMove = high - this.prevHigh;
    const downMove = this.prevLow - low;

    const plusDM = upMove > downMove && upMove > 0 ? upMove : 0;
    const minusDM = downMove > upMove && downMove > 0 ? downMove : 0;

    this.prevHigh = high;
    this.prevLow = low;
    this.prevClose = close;

    if (!this.diReady) {
      this.sumTR += tr;
      this.sumPlusDM += plusDM;
      this.sumMinusDM += minusDM;
      this.trCount++;

      if (this.trCount < this.period) {
        return { plusDI: null, minusDI: null, adx: null };
      }

      this.avgTR = this.sumTR / this.period;
      this.avgPlusDM = this.sumPlusDM / this.period;
      this.avgMinusDM = this.sumMinusDM / this.period;
      this.diReady = true;
    } else {
      this.avgTR = (this.avgTR * (this.period - 1) + tr) / this.period;
      this.avgPlusDM =
        (this.avgPlusDM * (this.period - 1) + plusDM) / this.period;
      this.avgMinusDM =
        (this.avgMinusDM * (this.period - 1) + minusDM) / this.period;
    }

    const plusDI = this.avgTR === 0 ? 0 : (100 * this.avgPlusDM) / this.avgTR;
    const minusDI =
      this.avgTR === 0 ? 0 : (100 * this.avgMinusDM) / this.avgTR;

    const diSum = plusDI + minusDI;
    const dx = diSum === 0 ? 0 : (100 * Math.abs(plusDI - minusDI)) / diSum;

    if (!this.adxReady) {
      this.sumDX += dx;
      this.dxCount++;

      if (this.dxCount === this.period) {
        this.adxValue = this.sumDX / this.period;
        this.adxReady = true;
      }

      return { plusDI, minusDI, adx: this.adxValue };
    }

    this.adxValue =
      ((this.adxValue as number) * (this.period - 1) + dx) / this.period;

    return { plusDI, minusDI, adx: this.adxValue };
  }
}
