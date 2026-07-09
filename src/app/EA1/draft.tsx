
/*
"use client";

import React, { useState } from "react";
import Papa from "papaparse";

export interface Candle {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CsvReaderProps {
  onCandle?: (candle: Candle) => void;
  onComplete?: (count: number) => void;
}

export default function CsvReader({
  onCandle,
  onComplete,
}: CsvReaderProps) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setCount(0);

    let total = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      dynamicTyping: true,

      step({ data }) {
        const row = data as any;

        onCandle?.({
          date: parseMtDate(row.Date),
          open: row.Open,
          high: row.High,
          low: row.Low,
          close: row.Close,
          volume: row.Volume,
        });

        total++;

        // Chỉ update UI mỗi 50.000 dòng
        if (total % 500 === 0) {
          setCount(total);
        }
      },

      complete() {
        setCount(total);
        setLoading(false);
        onComplete?.(total);
      },

      error(err) {
        console.error(err);
        setLoading(false);
      },
    });
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
      />

      <p>
        {loading
          ? `Reading ${count.toLocaleString()} rows...`
          : `Finished ${count.toLocaleString()} rows`}
      </p>
    </div>
  );
}

function parseMtDate(value: string): Date {
  const [d, t] = value.trim().split(" ");

  const [y, m, day] =
    d.indexOf(".") >= 0
      ? d.split(".").map(Number)
      : d.split("-").map(Number);

  const [h, min, s = "0"] = t.split(":");

  return new Date(
    y,
    m - 1,
    day,
    Number(h),
    Number(min),
    Number(s)
  );
}
*/


/*
"use client";

import { useState } from "react";
import Papa from "papaparse";

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function Page() {
  const [rows, setRows] = useState<Candle[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRows([]);
    setCount(0);
    setLoading(true);

    const preview: Candle[] = [];
    let total = 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      dynamicTyping: true,

      step({ data }) {
        const row = data as any;

        total++;

        if (preview.length < 50) {
          preview.push({
            date: row.Date,
            open: row.Open,
            high: row.High,
            low: row.Low,
            close: row.Close,
            volume: row.Volume,
          });
        }

        if (total % 10000 === 0) {
          setCount(total);
        }
      },

      complete() {
        setRows(preview);
        setCount(total);
        setLoading(false);
      },

      error(err) {
        console.error(err);
        setLoading(false);
      },
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>CSV Reader</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
      />

      <p>
        {loading
          ? `Reading... ${count.toLocaleString()} rows`
          : `Finished: ${count.toLocaleString()} rows`}
      </p>

      <table
        border={1}
        cellPadding={6}
        style={{
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Close</th>
            <th>Volume</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.date}</td>
              <td>{row.open}</td>
              <td>{row.high}</td>
              <td>{row.low}</td>
              <td>{row.close}</td>
              <td>{row.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
*/


"use client";

import { useState } from "react";

interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function Page() {
  const [rows, setRows] = useState<Candle[]>([]);
  const [reading, setReading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setRows([]);
    setReading(true);

    const reader = file
      .stream()
      .pipeThrough(new TextDecoderStream())
      .getReader();

    let buffer = "";
    const preview: Candle[] = [];
    let firstLine = true;

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += value;

      const lines = buffer.split(/\r?\n/);

      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;

        // bỏ header
        if (firstLine) {
          firstLine = false;
          continue;
        }

        const cols = line.split(",");

        if (cols.length !== 6) continue;

        preview.push({
          date: cols[0],
          open: Number(cols[1]),
          high: Number(cols[2]),
          low: Number(cols[3]),
          close: Number(cols[4]),
          volume: Number(cols[5]),
        });

        if (preview.length >= 50) {
          await reader.cancel();
          setRows(preview);
          setReading(false);
          return;
        }
      }
    }

    setRows(preview);
    setReading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
      />

      <p>{reading ? "Reading..." : "Done"}</p>
{/*
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Close</th>
            <th>Volume</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td>{r.open}</td>
              <td>{r.high}</td>
              <td>{r.low}</td>
              <td>{r.close}</td>
              <td>{r.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
*/}

<div className="mt-5 overflow-x-auto">
  <table className="w-full border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-100">
        <th className="border border-gray-300 p-2">Date</th>
        <th className="border border-gray-300 p-2">Open</th>
        <th className="border border-gray-300 p-2">High</th>
        <th className="border border-gray-300 p-2">Low</th>
        <th className="border border-gray-300 p-2">Close</th>
        <th className="border border-gray-300 p-2">Volume</th>
      </tr>
    </thead>

    <tbody>
      {rows.map((row, index) => (
        <tr key={index}>
          <td className="border border-gray-300 p-2">{row.date}</td>
          <td className="border border-gray-300 p-2">{row.open}</td>
          <td className="border border-gray-300 p-2">{row.high}</td>
          <td className="border border-gray-300 p-2">{row.low}</td>
          <td className="border border-gray-300 p-2">{row.close}</td>
          <td className="border border-gray-300 p-2">{row.volume}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>




    </div>
  );
}


