
// Sử dụng cho huấn luyện và luyện tập
// app/training-guide/page.tsx

/*
import { Candle } from "./Candle";

export interface CandleRow extends Candle {
  rsi: number | null;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}
*/

import { Candle } from "./Candle";

export interface CandleRow extends Candle {
  rsi: number | null;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
  ema20?: number | null;
  ema50?: number | null;
  plusDI?: number | null;
  minusDI?: number | null;
  adx?: number | null;
}
