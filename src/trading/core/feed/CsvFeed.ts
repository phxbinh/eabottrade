import { Feed } from "./Feed";
import { LineReader } from "./LineReader";
import { CsvMapper } from "../csv/CsvMapper";
import { Candle } from "../models/Candle";

export class CsvFeed implements Feed {
  private currentCandle: Candle | null = null;

  private opened = false;

  private headerSkipped = false;

  constructor(
    private readonly reader: LineReader,
    private readonly mapper: CsvMapper
  ) {}

  async open(): Promise<void> {
    if (this.opened) return;

    await this.reader.open();

    this.headerSkipped = false;
    this.currentCandle = null;
    this.opened = true;
  }

  async close(): Promise<void> {
    if (!this.opened) return;

    await this.reader.close();

    this.currentCandle = null;
    this.headerSkipped = false;
    this.opened = false;
  }

  async reset(): Promise<void> {
    if (!this.opened) {
      throw new Error(
        "Feed must be opened before reset()."
      );
    }

    await this.reader.reset();

    this.currentCandle = null;
    this.headerSkipped = false;
  }

  async next(): Promise<Candle | null> {
    if (!this.opened) {
      throw new Error(
        "Feed must be opened before next()."
      );
    }

    // Skip CSV header once.
    if (!this.headerSkipped) {
      await this.reader.nextLine();
      this.headerSkipped = true;
    }

    while (true) {
      const line = await this.reader.nextLine();

      if (line === null) {
        this.currentCandle = null;
        return null;
      }

      if (line.trim() === "") {
        continue;
      }

      this.currentCandle = this.mapper.map(line);

      return this.currentCandle;
    }
  }

  current(): Candle | null {
    return this.currentCandle;
  }
}