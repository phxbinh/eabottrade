import { Candle } from "../models/Candle";



/**
 * Supported formats:
 *
 * 2004.06.11 07:15
 * 2004-06-11 07:18:00
 */
export function parseTimestamp(value: string): number {
  const text = value.trim();

  const [datePart, timePart] = text.split(/\s+/);

  if (!datePart || !timePart) {
    throw new Error(`Invalid datetime: "${value}"`);
  }

  // Hỗ trợ cả "." và "-"
  const [year, month, day] = datePart
    .split(/[.-]/)
    .map(Number);

  const time = timePart.split(":").map(Number);

  const hour = time[0] ?? 0;
  const minute = time[1] ?? 0;
  const second = time[2] ?? 0;

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    !Number.isFinite(second)
  ) {
    throw new Error(`Invalid datetime: "${value}"`);
  }

  return Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second,
    0
  );
}


/*
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



*/


export class CsvMapper {
  /**
   * Convert one CSV line into a Candle.
   *
   * Expected format:
   *
   * Date,Open,High,Low,Close,Volume
   *
   * Example:
   *
   * 2004-06-11 07:18:00,384.0,384.1,384.0,384.0,3
   */
  
  map(line: string): Candle {

    let delimiter = "";

    if (line.includes(";")) {
      delimiter = ";";
    } else {
      delimiter = ",";
    }
    const cols = line.split(delimiter);

    if (cols.length !== 6) {
      throw new Error(
        `Invalid CSV column count: ${cols.length}`
      );
    }

    const [
      date,
      open,
      high,
      low,
      close,
      volume,
    ] = cols;

    //const time = Date.parse(date);
    const time = parseTimestamp(date);

    if (Number.isNaN(time)) {
      throw new Error(
        `Invalid date: ${date}`
      );
    }

    const candle: Candle = {
      time,

      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume),
    };

    if (!Number.isFinite(candle.open))
      throw new Error("Invalid Open");

    if (!Number.isFinite(candle.high))
      throw new Error("Invalid High");

    if (!Number.isFinite(candle.low))
      throw new Error("Invalid Low");

    if (!Number.isFinite(candle.close))
      throw new Error("Invalid Close");

    if (!Number.isFinite(candle.volume))
      throw new Error("Invalid Volume");

    if (candle.high < candle.low) {
      throw new Error(
        "High must be greater than Low"
      );
    }

    if (candle.high < candle.open)
      throw new Error("Invalid High");

    if (candle.high < candle.close)
      throw new Error("Invalid High");

    if (candle.low > candle.open)
      throw new Error("Invalid Low");

    if (candle.low > candle.close)
      throw new Error("Invalid Low");

    return candle;
  }
}