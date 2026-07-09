"use client";

import { useMemo, useRef, useState } from "react";

import { Candle } from "@models/Candle";

import { StreamCsvReader } from "@feed/StreamCsvReader";
import { CsvFeed } from "@feed/CsvFeed";

import { CsvMapper } from "@csv/CsvMapper";

import { HistoryBuffer } from "@bufferHistory/BufferHistory";

import { calculateRSI, calculateMACD } from "@indicators/TechnicalIndicators";

const BUFFER_SIZE = 50;
const RSI_PERIOD = 14;
const MACD_FAST = 12;
const MACD_SLOW = 26;
const MACD_SIGNAL = 9;

export default function TradeCsvPage() {
  const history = useMemo(() => new HistoryBuffer(BUFFER_SIZE), []);

  const feedRef = useRef<CsvFeed | null>(null);
  const fileRef = useRef<File | null>(null);

  const [, forceUpdate] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [totalRead, setTotalRead] = useState(0);
  const [busy, setBusy] = useState(false);

  function refresh() {
    forceUpdate((v) => v + 1);
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

    history.clear();
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
    history.clear();
    setTotalRead(0);
    setStatus("Closed");
    refresh();
  }

  async function resetFeed() {
    if (!feedRef.current) return;
    await feedRef.current.reset();
    history.clear();
    setTotalRead(0);
    setStatus("Reset");
    refresh();
  }

  async function read(limit?: number) {
    if (!feedRef.current) return;
    if (busy) return;

    setBusy(true);
    let count = 0;

    while (true) {
      if (limit !== undefined && count >= limit) break;

      const candle = await feedRef.current.next();
      if (!candle) {
        setStatus("EOF");
        break;
      }

      history.push(candle);
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

  const rows: Candle[] = [];
  for (let i = 0; i < history.size; i++) {
    const candle = history.at(i);
    if (candle) rows.push(candle);
  }

  // Tính chỉ số trên các nến hiện có trong buffer
  const rsiValues = calculateRSI(rows, RSI_PERIOD);
  const macd = calculateMACD(rows, MACD_FAST, MACD_SLOW, MACD_SIGNAL);

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
          <InfoRow
            label="RSI(14) mới nhất"
            value={
              rsiValues[rsiValues.length - 1] != null
                ? rsiValues[rsiValues.length - 1]!.toFixed(2)
                : "-"
            }
          />
          <InfoRow
            label="MACD Histogram mới nhất"
            value={
              macd.histogram[macd.histogram.length - 1] != null
                ? macd.histogram[macd.histogram.length - 1]!.toFixed(4)
                : "-"
            }
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
              <td style={cellStyle}>{rsiValues[index] != null ? rsiValues[index]!.toFixed(2) : "-"}</td>
              <td style={cellStyle}>{macd.macdLine[index] != null ? macd.macdLine[index]!.toFixed(4) : "-"}</td>
              <td style={cellStyle}>{macd.signalLine[index] != null ? macd.signalLine[index]!.toFixed(4) : "-"}</td>
              <td style={cellStyle}>{macd.histogram[index] != null ? macd.histogram[index]!.toFixed(4) : "-"}</td>
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
