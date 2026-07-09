"use client";

import { useState } from "react";

import { Candle } from "@/models/Candle";
import { StreamCsvReader } from "@/feed/StreamCsvReader";
import { CsvFeed } from "@/feed/CsvFeed";
import { CsvMapper } from "@/csv/CsvMapper";

export default function TradeCsvPage() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [rows, setRows] = useState<Candle[]>([]);

  async function handleFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setRows([]);
    setCount(0);

    try {
      const reader = new StreamCsvReader(file);
      const mapper = new CsvMapper();
      const feed = new CsvFeed(reader, mapper);

      await feed.open();

      const first50: Candle[] = [];

      let total = 0;

      while (true) {
        const candle = await feed.next();

        if (!candle) break;

        total++;

        if (first50.length < 50) {
          first50.push(candle);
        }

        // cập nhật UI mỗi 100.000 nến
        if (total % 100000 === 0) {
          setCount(total);
          await new Promise(requestAnimationFrame);
        }
      }

      setRows(first50);
      setCount(total);

      await feed.close();
    } catch (err) {
      console.error(err);
      alert(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>CSV Feed Test</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
      />

      <p>
        <b>Status:</b>{" "}
        {loading ? "Reading..." : "Idle"}
      </p>

      <p>
        <b>Total Candles:</b> {count}
      </p>

      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginTop: 20,
        }}
      >
        <thead>
          <tr>
            {[
              "Time",
              "Open",
              "High",
              "Low",
              "Close",
              "Volume",
            ].map((h) => (
              <th
                key={h}
                style={{
                  border: "1px solid #ccc",
                  padding: 8,
                  textAlign: "left",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((c, i) => (
            <tr key={i}>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: 6,
                }}
              >
                {new Date(c.time).toISOString()}
              </td>

              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                {c.open}
              </td>

              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                {c.high}
              </td>

              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                {c.low}
              </td>

              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                {c.close}
              </td>

              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                {c.volume}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}