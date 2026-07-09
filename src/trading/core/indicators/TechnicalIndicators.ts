interface HasClose {
  close: number;
}

export function calculateRSI<T extends HasClose>(
  candles: T[],
  period: number = 14
): (number | null)[] {
  const closes = candles.map((c) => c.close);
  const rsi: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length <= period) return rsi;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return rsi;
}

function calculateEMA(values: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = new Array(values.length).fill(null);
  const k = 2 / (period + 1);
  if (values.length < period) return ema;

  const sma = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema[period - 1] = sma;

  for (let i = period; i < values.length; i++) {
    ema[i] = values[i] * k + (ema[i - 1] as number) * (1 - k);
  }

  return ema;
}

export interface MACDResult {
  macdLine: (number | null)[];
  signalLine: (number | null)[];
  histogram: (number | null)[];
}

export function calculateMACD<T extends HasClose>(
  candles: T[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const closes = candles.map((c) => c.close);
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: (number | null)[] = closes.map((_, i) =>
    fastEMA[i] === null || slowEMA[i] === null
      ? null
      : (fastEMA[i] as number) - (slowEMA[i] as number)
  );

  const macdValues = macdLine.filter((v): v is number => v !== null);
  const signalEMA = calculateEMA(macdValues, signalPeriod);
  const firstMacdIndex = macdLine.findIndex((v) => v !== null);

  const signalLine: (number | null)[] = new Array(closes.length).fill(null);
  const histogram: (number | null)[] = new Array(closes.length).fill(null);

  signalEMA.forEach((val, i) => {
    if (val !== null) {
      const idx = firstMacdIndex + i;
      signalLine[idx] = val;
      histogram[idx] = (macdLine[idx] as number) - val;
    }
  });

  return { macdLine, signalLine, histogram };
}
