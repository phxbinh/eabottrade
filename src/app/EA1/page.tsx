
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
    let delimiter = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += value;

      const lines = buffer.split(/\r?\n/);

      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;

/*
        // bỏ header
        if (firstLine) {
          firstLine = false;
          continue;
        }

        const cols = line.split(",");
*/

  // Tự động phát hiện dấu phân cách từ dòng header đầu tiên
  if (firstLine) {
    if (line.includes(";")) {
      delimiter = ";";
    } else {
      delimiter = ",";
    }
    firstLine = false;
    continue; // Bỏ qua dòng header
  }

  // Sử dụng delimiter đã tìm được
  const cols = line.split(delimiter);

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


