"use client";

import { useMemo, useRef, useState } from "react";

import { Candle } from "@models/Candle";

import { StreamCsvReader } from "@feed/StreamCsvReader";
import { CsvFeed } from "@feed/CsvFeed";

import { CsvMapper } from "@csv/CsvMapper";

import { HistoryBuffer } from "@history/HistoryBuffer";

const BUFFER_CAPACITY = 50;

export default function HistoryBufferPlayground() {
  const fileRef = useRef<File | null>(null);

  const feedRef = useRef<CsvFeed | null>(null);

  const history = useMemo(
    () => new HistoryBuffer(BUFFER_CAPACITY),
    []
  );

  const [, forceRender] = useState(0);

  const [status, setStatus] = useState<
    "Idle" | "Opened" | "Closed"
  >("Idle");

  const [readCount, setReadCount] = useState(0);

  function refresh() {
    forceRender((v) => v + 1);
  }

  async function chooseFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    fileRef.current = file;

    setStatus("Idle");
  }

  async function openFeed() {
    if (!fileRef.current) {
      alert("Please choose a CSV file.");

      return;
    }

    if (feedRef.current) {
      await feedRef.current.close();
    }

    history.clear();

    setReadCount(0);

    const reader = new StreamCsvReader(
      fileRef.current
    );

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

    setReadCount(0);

    setStatus("Closed");

    refresh();
  }

  const rows: Candle[] = [];

  for (let i = 0; i < history.size; i++) {
    const candle = history.at(i);

    if (candle) {
      rows.push(candle);
    }
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <h1>HistoryBuffer Playground</h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={chooseFile}
        />

        <button onClick={openFeed}>
          Open Feed
        </button>

        <button onClick={closeFeed}>
          Close Feed
        </button>
      </div>

      <table
        style={{
          borderCollapse: "collapse",
          width: 450,
          marginBottom: 24,
        }}
      >
        <tbody>
          <InfoRow
            label="Status"
            value={status}
          />

          <InfoRow
            label="Read Count"
            value={readCount}
          />

          <InfoRow
            label="Buffer Size"
            value={history.size}
          />

          <InfoRow
            label="Capacity"
            value={history.capacity}
          />

          <InfoRow
            label="Is Full"
            value={
              history.isFull
                ? "Yes"
                : "No"
            }
          />

          <InfoRow
            label="Oldest"
            value={
              history.oldest
                ? history.oldest.time
                : "-"
            }
          />

          <InfoRow
            label="Latest"
            value={
              history.latest
                ? history.latest.time
                : "-"
            }
          />
        </tbody>
      </table>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            {[
              "#",
              "Time",
              "Open",
              "High",
              "Low",
              "Close",
              "Volume",
            ].map((h) => (
              <th
                key={h}
                style={cellStyle}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((candle, index) => (
            <tr key={index}>
              <td style={cellStyle}>
                {index}
              </td>

              <td style={cellStyle}>
                {new Date(
                  candle.time
                ).toISOString()}
              </td>

              <td style={cellStyle}>
                {candle.open}
              </td>

              <td style={cellStyle}>
                {candle.high}
              </td>

              <td style={cellStyle}>
                {candle.low}
              </td>

              <td style={cellStyle}>
                {candle.close}
              </td>

              <td style={cellStyle}>
                {candle.volume}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <tr>
      <td style={cellStyle}>
        <b>{label}</b>
      </td>

      <td style={cellStyle}>
        {value}
      </td>
    </tr>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: 8,
  textAlign: "left",
};