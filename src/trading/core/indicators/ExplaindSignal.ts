
// Sử dụng cho huấn luyện và luyện tập
// app/training-guide/page.tsx

export function explainSignal(
  rsi: number | null,
  histogram: number | null
): string {
  const parts: string[] = [];

  if (rsi != null) {
    if (rsi >= 70) {
      parts.push(`RSI ${rsi.toFixed(1)} — đang ở vùng quá mua.`);
    } else if (rsi <= 30) {
      parts.push(`RSI ${rsi.toFixed(1)} — đang ở vùng quá bán.`);
    } else {
      parts.push(`RSI ${rsi.toFixed(1)} — vùng trung tính.`);
    }
  }

  if (histogram != null) {
    if (histogram > 0) {
      parts.push("MACD Histogram dương — phe mua đang chiếm ưu thế.");
    } else if (histogram < 0) {
      parts.push("MACD Histogram âm — phe bán đang chiếm ưu thế.");
    } else {
      parts.push("MACD Histogram gần 0 — hai phe đang cân bằng.");
    }
  }

  return parts.join(" ");
}
