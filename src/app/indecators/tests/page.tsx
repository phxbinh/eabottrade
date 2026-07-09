"use client";

import { useRef, useState } from "react";

import { Candle } from "@models/Candle";

import { StreamCsvReader } from "@feed/StreamCsvReader";
import { CsvFeed } from "@feed/CsvFeed";

import { CsvMapper } from "@csv/CsvMapper";

//src/trading/core/bufferHistory/BufferHistory-Indecators.ts
import { HistoryBuffer } from "@bufferHistory/BufferHistory-Indecators";

import { RSIStream } from "@indicators/RSIStream";
import { MACDStream } from "@indicators/MACDStream";

const BUFFER_SIZE = 50;
const RSI_PERIOD = 14;
const MACD_FAST = 12;
const MACD_SLOW = 26;
const MACD_SIGNAL = 9;

interface CandleRow extends Candle {
  rsi: number | null;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export default function TradeCsvPage() {
  // Buffer giờ giữ CandleRow (nến + chỉ số đã gắn sẵn), không phải Candle thô
  const historyRef = useRef<HistoryBuffer<CandleRow>>(
    new HistoryBuffer<CandleRow>(BUFFER_SIZE)
  );

  const feedRef = useRef<CsvFeed | null>(null);
  const fileRef = useRef<File | null>(null);

  // Stream giữ state liên tục, KHÔNG phụ thuộc buffer window
  const rsiStreamRef = useRef<RSIStream | null>(null);
  const macdStreamRef = useRef<MACDStream | null>(null);

  const [, forceUpdate] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [totalRead, setTotalRead] = useState(0);
  const [busy, setBusy] = useState(false);

  function refresh() {
    forceUpdate((v) => v + 1);
  }

  function resetIndicatorStreams() {
    rsiStreamRef.current = new RSIStream(RSI_PERIOD);
    macdStreamRef.current = new MACDStream(MACD_FAST, MACD_SLOW, MACD_SIGNAL);
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
    if (!feedRef.current) return;
    await feedRef.current.reset();
    historyRef.current.clear();
    resetIndicatorStreams(); // reset lại cả state RSI/MACD vì đọc lại từ đầu file
    setTotalRead(0);
    setStatus("Reset");
    refresh();
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

      // Update state stream TRƯỚC khi push — đây là điểm mấu chốt:
      // chỉ số được tính trên toàn bộ chuỗi đã đọc, không phải trên 50 nến còn lại trong buffer
      const rsi = rsiStreamRef.current.update(candle.close);
      const { macd, signal, histogram } = macdStreamRef.current.update(candle.close);

      const row: CandleRow = { ...candle, rsi, macd, signal, histogram };
      historyRef.current.push(row);

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

  const history = historyRef.current;

  const rows: CandleRow[] = [];
  for (let i = 0; i < history.size; i++) {
    const candle = history.at(i);
    if (candle) rows.push(candle);
  }

  const latest = rows[rows.length - 1];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <h1>HistoryBuffer Playground</h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input type="file" accept=".csv" onChange={handleFile} />
        <button onClick={openFeed} disabled={busy}>Open</button>
        <button onClick={closeFeed} disabled={busy}>Close</button>
        <button onClick={resetFeed} disabled={busy}>Reset</button>
        <button onClick={() => read(1)} disabled={busy}>Next</button>
        <button onClick={() => read(100)} disabled={busy}>Next 100</button>
        <button onClick={() => read(1000)} disabled={busy}>Next 1000</button>
        <button onClick={() => read(10000)} disabled={busy}>Next 10000</button>
        <button onClick={() => read()} disabled={busy}>Run All</button>
      </div>

      <table style={{ borderCollapse: "collapse", width: 500 }}>
        <tbody>
          <InfoRow label="Status" value={status} />
          <InfoRow label="Busy" value={busy ? "Yes" : "No"} />
          <InfoRow label="Read Count" value={totalRead} />
          <InfoRow label="Buffer Size" value={history.size} />
          <InfoRow label="Capacity" value={history.capacity} />
          <InfoRow label="Is Full" value={history.isFull ? "Yes" : "No"} />
          <InfoRow
            label="Oldest"
            value={history.oldest ? new Date(history.oldest.time).toLocaleString() : "-"}
          />
          <InfoRow
            label="Latest"
            value={history.latest ? new Date(history.latest.time).toLocaleString() : "-"}
          />
          <InfoRow label="RSI(14) mới nhất" value={latest?.rsi != null ? latest.rsi.toFixed(2) : "-"} />
          <InfoRow
            label="MACD Histogram mới nhất"
            value={latest?.histogram != null ? latest.histogram.toFixed(4) : "-"}
          />
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cellStyle}>#</th>
            <th style={cellStyle}>Time</th>
            <th style={cellStyle}>Open</th>
            <th style={cellStyle}>High</th>
            <th style={cellStyle}>Low</th>
            <th style={cellStyle}>Close</th>
            <th style={cellStyle}>Volume</th>
            <th style={cellStyle}>RSI(14)</th>
            <th style={cellStyle}>MACD</th>
            <th style={cellStyle}>Signal</th>
            <th style={cellStyle}>Histogram</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((candle, index) => (
            <tr key={index}>
              <td style={cellStyle}>{index}</td>
              <td style={cellStyle}>{new Date(candle.time).toLocaleString()}</td>
              <td style={cellStyle}>{candle.open}</td>
              <td style={cellStyle}>{candle.high}</td>
              <td style={cellStyle}>{candle.low}</td>
              <td style={cellStyle}>{candle.close}</td>
              <td style={cellStyle}>{candle.volume}</td>
              <td style={cellStyle}>{candle.rsi != null ? candle.rsi.toFixed(2) : "-"}</td>
              <td style={cellStyle}>{candle.macd != null ? candle.macd.toFixed(4) : "-"}</td>
              <td style={cellStyle}>{candle.signal != null ? candle.signal.toFixed(4) : "-"}</td>
              <td style={cellStyle}>{candle.histogram != null ? candle.histogram.toFixed(4) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td style={{ ...cellStyle, fontWeight: 600, width: 180 }}>{label}</td>
      <td style={cellStyle}>{value}</td>
    </tr>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #cfcfcf",
  padding: "8px 10px",
  textAlign: "left",
  whiteSpace: "nowrap",
};
