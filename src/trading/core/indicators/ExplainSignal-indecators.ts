export interface SignalSnapshot {
  rsi: number | null;
  histogram: number | null;
  ema20: number | null;
  ema50: number | null;
  adx: number | null;
}

export function explainSignal(
  current: SignalSnapshot,
  previous: SignalSnapshot | null
): string {
  const parts: string[] = [];

  // RSI
  if (current.rsi != null) {
    if (current.rsi >= 70) {
      parts.push(`RSI ${current.rsi.toFixed(1)} — đang ở vùng quá mua.`);
    } else if (current.rsi <= 30) {
      parts.push(`RSI ${current.rsi.toFixed(1)} — đang ở vùng quá bán.`);
    } else {
      parts.push(`RSI ${current.rsi.toFixed(1)} — vùng trung tính.`);
    }
  }

  // MACD Histogram
  if (current.histogram != null) {
    if (current.histogram > 0) {
      parts.push("MACD Histogram dương — phe mua đang chiếm ưu thế.");
    } else if (current.histogram < 0) {
      parts.push("MACD Histogram âm — phe bán đang chiếm ưu thế.");
    } else {
      parts.push("MACD Histogram gần 0 — hai phe đang cân bằng.");
    }
  }

  // EMA20/EMA50 crossover (golden cross / death cross)
  if (
    previous?.ema20 != null &&
    previous?.ema50 != null &&
    current.ema20 != null &&
    current.ema50 != null
  ) {
    const wasBelow = previous.ema20 <= previous.ema50;
    const isAbove = current.ema20 > current.ema50;
    const wasAbove = previous.ema20 >= previous.ema50;
    const isBelow = current.ema20 < current.ema50;

    if (wasBelow && isAbove) {
      parts.push(
        "EMA20 vừa cắt lên EMA50 — golden cross, thường gắn với xu hướng tăng."
      );
    } else if (wasAbove && isBelow) {
      parts.push(
        "EMA20 vừa cắt xuống EMA50 — death cross, thường gắn với xu hướng giảm."
      );
    } else if (isAbove) {
      parts.push("EMA20 vẫn nằm trên EMA50 — xu hướng ngắn hạn đang tăng.");
    } else if (isBelow) {
      parts.push("EMA20 vẫn nằm dưới EMA50 — xu hướng ngắn hạn đang giảm.");
    }
  }

  // ADX
  if (current.adx != null) {
    if (current.adx >= 25) {
      parts.push(`ADX ${current.adx.toFixed(1)} — xu hướng đang mạnh (>25).`);
    } else {
      parts.push(
        `ADX ${current.adx.toFixed(1)} — xu hướng còn yếu hoặc đang đi ngang (<25).`
      );
    }
  }

  return parts.join(" ");
}
