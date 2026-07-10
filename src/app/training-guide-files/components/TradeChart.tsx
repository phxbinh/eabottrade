"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  ColorType,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";

import { CandleRow } from "@models/CandleRow";

interface TradeChartProps {
  rows: CandleRow[];
}

export function TradeChart({ rows }: TradeChartProps) {
  const priceContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);

  const priceChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const signalLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const histogramSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // Khởi tạo 3 chart một lần
  useEffect(() => {
    if (
      !priceContainerRef.current ||
      !rsiContainerRef.current ||
      !macdContainerRef.current
    ) {
      return;
    }

    const commonOptions = {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
      timeScale: { timeVisible: true, secondsVisible: false },
    };

    priceChartRef.current = createChart(priceContainerRef.current, {
      ...commonOptions,
      height: 300,
    });
    candleSeriesRef.current = priceChartRef.current.addSeries(
      CandlestickSeries,
      {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      }
    );

    rsiChartRef.current = createChart(rsiContainerRef.current, {
      ...commonOptions,
      height: 120,
    });
    rsiSeriesRef.current = rsiChartRef.current.addSeries(LineSeries, {
      color: "#7e57c2",
    });
    rsiSeriesRef.current.createPriceLine({
      price: 70,
      color: "#ef5350",
      lineStyle: 2,
      title: "Quá mua (70)",
    });
    rsiSeriesRef.current.createPriceLine({
      price: 30,
      color: "#26a69a",
      lineStyle: 2,
      title: "Quá bán (30)",
    });

    macdChartRef.current = createChart(macdContainerRef.current, {
      ...commonOptions,
      height: 140,
    });
    histogramSeriesRef.current = macdChartRef.current.addSeries(
      HistogramSeries,
      {}
    );
    macdLineSeriesRef.current = macdChartRef.current.addSeries(LineSeries, {
      color: "#2962ff",
    });
    signalLineSeriesRef.current = macdChartRef.current.addSeries(LineSeries, {
      color: "#ff6d00",
    });

    return () => {
      priceChartRef.current?.remove();
      rsiChartRef.current?.remove();
      macdChartRef.current?.remove();
    };
  }, []);

  // Đổ dữ liệu mỗi khi rows thay đổi
  useEffect(() => {
    if (rows.length === 0) return;

    const toTime = (ms: number) => (ms / 1000) as UTCTimestamp;

    candleSeriesRef.current?.setData(
      rows.map((r) => ({
        time: toTime(r.time),
        open: r.open,
        high: r.high,
        low: r.low,
        close: r.close,
      }))
    );

    rsiSeriesRef.current?.setData(
      rows
        .filter((r) => r.rsi != null)
        .map((r) => ({ time: toTime(r.time), value: r.rsi as number }))
    );

    macdLineSeriesRef.current?.setData(
      rows
        .filter((r) => r.macd != null)
        .map((r) => ({ time: toTime(r.time), value: r.macd as number }))
    );

    signalLineSeriesRef.current?.setData(
      rows
        .filter((r) => r.signal != null)
        .map((r) => ({ time: toTime(r.time), value: r.signal as number }))
    );

    histogramSeriesRef.current?.setData(
      rows
        .filter((r) => r.histogram != null)
        .map((r) => ({
          time: toTime(r.time),
          value: r.histogram as number,
          color: (r.histogram as number) >= 0 ? "#26a69a" : "#ef5350",
        }))
    );
  }, [rows]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div>
        <p style={{ margin: "0 0 4px", fontSize: 13, color: "#666" }}>
          Giá (nến)
        </p>
        <div ref={priceContainerRef} />
      </div>
      <div>
        <p style={{ margin: "8px 0 4px", fontSize: 13, color: "#666" }}>
          RSI(14)
        </p>
        <div ref={rsiContainerRef} />
      </div>
      <div>
        <p style={{ margin: "8px 0 4px", fontSize: 13, color: "#666" }}>
          MACD(12,26,9)
        </p>
        <div ref={macdContainerRef} />
      </div>
    </div>
  );
}




