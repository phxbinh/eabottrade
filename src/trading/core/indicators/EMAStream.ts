export class EMAStream {
  private readonly period: number;
  private readonly k: number;
  private sum = 0;
  private count = 0;
  private ready = false;
  private currentValue: number | null = null;

  constructor(period: number) {
    this.period = period;
    this.k = 2 / (period + 1);
  }

  get value(): number | null {
    return this.currentValue;
  }

  update(value: number): number | null {
    if (!this.ready) {
      this.sum += value;
      this.count++;

      if (this.count === this.period) {
        this.currentValue = this.sum / this.period;
        this.ready = true;
      }

      return this.currentValue;
    }

    this.currentValue = value * this.k + (this.currentValue as number) * (1 - this.k);
    return this.currentValue;
  }
}
