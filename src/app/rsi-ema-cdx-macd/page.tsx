"use client";

import { useRef, useState } from "react";

import { CandleRow } from "@models/CandleRow";

import { StreamCsvReader } from "@feed/StreamCsvReader";
import { CsvFeed } from "@feed/CsvFeed";

import { CsvMapper } from "@csv/CsvMapper";

//src/trading/core/bufferHistory/BufferHistory-Indecators.ts
import { HistoryBuffer } from "@bufferHistory/BufferHistory-Indecators";

import { RSIStream } from "@indicators/RSIStream";
import { MACDStream } from "@indicators/MACDStream";
import { explainSignal } from "@indicators/ExplainSignal";
import { TradeChart } from "./components/TradeChart";

// 45
import { EMAStream } from "@indicators/EMAStream";
import { ADXStream } from "@indicators/ADXStream";

// Load file từ trong dự án.
import { CSV_DATASETS, type CsvDataset } from "@data/csvDatasets";

const BUFFER_SIZE = 200; // tăng lên để chart có đủ nến hiển thị đẹp
const RSI_PERIOD = 14;
const MACD_FAST = 12;
const MACD_SLOW = 26;
const MACD_SIGNAL = 9;

// 45
const EMA20_PERIOD = 20;
const EMA50_PERIOD = 50;
const ADX_PERIOD = 14;

export default function TradeCsvPage() {
  const historyRef = useRef<HistoryBuffer<CandleRow>>(
    new HistoryBuffer<CandleRow>(BUFFER_SIZE)
  );

  const feedRef = useRef<CsvFeed | null>(null);
  const fileRef = useRef<File | null>(null);

  const rsiStreamRef = useRef<RSIStream | null>(null);
  const macdStreamRef = useRef<MACDStream | null>(null);
// 45
const ema20StreamRef = useRef<EMAStream | null>(null);
const ema50StreamRef = useRef<EMAStream | null>(null);
const adxStreamRef = useRef<ADXStream | null>(null);

  const autoPlayRef = useRef(false);

  const [, forceUpdate] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [totalRead, setTotalRead] = useState(0);
  const [busy, setBusy] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speedMs, setSpeedMs] = useState(200);
  // Load file trong dự án
  const [selectedPath, setSelectedPath] = useState("");
// Chọn file từ data/*.csv trong thư mục của dự án
async function selectDataset(dataset: CsvDataset) {
  setStatus("Đang tải " + dataset.label + "...");

  try {
    const res = await fetch(dataset.path);
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const csvText = await res.text();
    const fileName = dataset.path.split("/").pop() ?? "data.csv";
    const blob = new Blob([csvText], { type: "text/csv" });
    const file = new File([blob], fileName, { type: "text/csv" });

    fileRef.current = file;
    setSelectedPath(dataset.path);
    setStatus("File Selected: " + dataset.label);
  } catch (err) {
    setStatus("Lỗi tải file: " + dataset.path);
  }
}

  function refresh() {
    forceUpdate((v) => v + 1);
  }

/*
  function resetIndicatorStreams() {
    rsiStreamRef.current = new RSIStream(RSI_PERIOD);
    macdStreamRef.current = new MACDStream(MACD_FAST, MACD_SLOW, MACD_SIGNAL);
  }
*/
function resetIndicatorStreams() {
  rsiStreamRef.current = new RSIStream(RSI_PERIOD);
  macdStreamRef.current = new MACDStream(MACD_FAST, MACD_SLOW, MACD_SIGNAL);
  ema20StreamRef.current = new EMAStream(EMA20_PERIOD);
  ema50StreamRef.current = new EMAStream(EMA50_PERIOD);
  adxStreamRef.current = new ADXStream(ADX_PERIOD);
}


  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    fileRef.current = file;
    setStatus("File Selected");
  }

  async function openFeed() {
    if (!fileRef.current) {
      alert("Choose csv first.");
      return;
    }

    if (feedRef.current) {
      await feedRef.current.close();
    }

    historyRef.current.clear();
    resetIndicatorStreams();
    setTotalRead(0);

    const reader = new StreamCsvReader(fileRef.current);
    const mapper = new CsvMapper();
    const feed = new CsvFeed(reader, mapper);

    await feed.open();
    feedRef.current = feed;
    setStatus("Opened");
    refresh();
  }

  async function closeFeed() {
    autoPlayRef.current = false;
    setAutoPlay(false);

    if (!feedRef.current) return;
    await feedRef.current.close();
    feedRef.current = null;
    historyRef.current.clear();
    rsiStreamRef.current = null;
    macdStreamRef.current = null;
    setTotalRead(0);
    setStatus("Closed");
    refresh();
  }

  async function resetFeed() {
    autoPlayRef.current = false;
    setAutoPlay(false);

    if (!feedRef.current) return;
    await feedRef.current.reset();
    historyRef.current.clear();
    resetIndicatorStreams();
    setTotalRead(0);
    setStatus("Reset");
    refresh();
  }

/*
  function pushOne(candle: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }) {
    const rsi = rsiStreamRef.current!.update(candle.close);
    const { macd, signal, histogram } = macdStreamRef.current!.update(
      candle.close
    );

    const row: CandleRow = { ...candle, rsi, macd, signal, histogram };
    historyRef.current.push(row);
  }
*/
function pushOne(candle: {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}) {
  const rsi = rsiStreamRef.current!.update(candle.close);
  const { macd, signal, histogram } = macdStreamRef.current!.update(
    candle.close
  );
  const ema20 = ema20StreamRef.current!.update(candle.close);
  const ema50 = ema50StreamRef.current!.update(candle.close);
  const { plusDI, minusDI, adx } = adxStreamRef.current!.update(
    candle.high,
    candle.low,
    candle.close
  );

  const row: CandleRow = {
    ...candle,
    rsi,
    macd,
    signal,
    histogram,
    ema20,
    ema50,
    plusDI,
    minusDI,
    adx,
  };

  historyRef.current.push(row);
}





  async function read(limit?: number) {
    if (!feedRef.current) return;
    if (busy) return;
    if (!rsiStreamRef.current || !macdStreamRef.current) return;

    setBusy(true);
    let count = 0;

    while (true) {
      if (limit !== undefined && count >= limit) break;

      const candle = await feedRef.current.next();
      if (!candle) {
        setStatus("EOF");
        break;
      }

      pushOne(candle);
      count++;

      if (limit === undefined && count % 10000 === 0) {
        setTotalRead((v) => v + 10000);
        refresh();
        await new Promise(requestAnimationFrame);
      }
    }

    if (limit !== undefined) {
      setTotalRead((v) => v + count);
    }

    refresh();
    setBusy(false);
  }

  // Auto-play: đọc từng nến một, có delay, giống xem lại thị trường
  async function play() {
    if (!feedRef.current || !rsiStreamRef.current || !macdStreamRef.current) {
      return;
    }
    if (autoPlayRef.current) return;

    autoPlayRef.current = true;
    setAutoPlay(true);

    while (autoPlayRef.current) {
      const candle = await feedRef.current.next();

      if (!candle) {
        setStatus("EOF");
        break;
      }

      pushOne(candle);
      setTotalRead((v) => v + 1);
      refresh();

      await new Promise((resolve) => setTimeout(resolve, speedMs));
    }

    autoPlayRef.current = false;
    setAutoPlay(false);
  }

  function pause() {
    autoPlayRef.current = false;
    setAutoPlay(false);
  }

  const history = historyRef.current;

  const rows: CandleRow[] = [];
  for (let i = 0; i < history.size; i++) {
    const candle = history.at(i);
    if (candle) rows.push(candle);
  }

  const latest = rows[rows.length - 1];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1>XAUUSD — Học đọc RSI/MACD qua dữ liệu lịch sử</h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
<select
  value={selectedPath}
  onChange={(e) => {
    const dataset = CSV_DATASETS.find((d) => d.path === e.target.value);
    if (dataset) selectDataset(dataset);
  }}
  disabled={busy || autoPlay}
>
  <option value="">-- Chọn dữ liệu có sẵn --</option>
  {CSV_DATASETS.map((d) => (
    <option key={d.path} value={d.path}>
      {d.label}
    </option>
  ))}
</select>

        <input type="file" accept=".csv" onChange={handleFile} />
        <button onClick={openFeed} disabled={busy || autoPlay}>Open</button>
        <button onClick={closeFeed} disabled={busy}>Close</button>
        <button onClick={resetFeed} disabled={busy || autoPlay}>Reset</button>
        <button onClick={() => read(1)} disabled={busy || autoPlay}>Next</button>
        <button onClick={() => read(100)} disabled={busy || autoPlay}>Next 100</button>

        <span style={{ marginLeft: 12 }}>Tốc độ phát:</span>
        <select
          value={speedMs}
          onChange={(e) => setSpeedMs(Number(e.target.value))}
          disabled={autoPlay}
        >
          <option value={1000}>Chậm (1s/nến)</option>
          <option value={400}>Vừa (0.4s/nến)</option>
          <option value={100}>Nhanh (0.1s/nến)</option>
        </select>

        {!autoPlay ? (
          <button onClick={play} disabled={busy}>▶ Play</button>
        ) : (
          <button onClick={pause}>⏸ Pause</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 14 }}>
        <span>Status: <b>{status}</b></span>
        <span>Đã đọc: <b>{totalRead}</b></span>
        <span>Buffer: <b>{history.size}/{history.capacity}</b></span>
      </div>

      {rows.length > 0 && (
        <>
          <TradeChart rows={rows} />

          <div
            style={{
              padding: 12,
              background: "#f5f5f5",
              borderRadius: 8,
              fontSize: 15,
            }}
          >
            {explainSignal(latest?.rsi ?? null, latest?.histogram ?? null)}
          </div>
        </>
      )}

{/* Hiển thị liên kết đến tradingview.com
Nằm trong điều khoản sử dụng thư viện và bản quyền
*/}
<footer style={{ fontSize: 11, color: "#999", padding: "8px 0", textAlign: "center" }}>
  Chart powered by{" "}
  <a
    href="https://www.tradingview.com/"
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#999" }}
  >
    TradingView Lightweight Charts™
  </a>
</footer>


    </div>
  );
}