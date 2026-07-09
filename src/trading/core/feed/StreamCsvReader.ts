import { LineReader } from "./LineReader";

export class StreamCsvReader implements LineReader {
  private readonly file: File;

  private reader?: ReadableStreamDefaultReader<string>;

  private buffer = "";

  constructor(file: File) {
    this.file = file;
  }

  async open(): Promise<void> {
    this.reader = this.file
      .stream()
      .pipeThrough(new TextDecoderStream())
      .getReader();

    this.buffer = "";
  }

  async close(): Promise<void> {
    if (this.reader) {
      await this.reader.cancel();
    }

    this.reader = undefined;
    this.buffer = "";
  }

  async reset(): Promise<void> {
    await this.close();
    await this.open();
  }

  async nextLine(): Promise<string | null> {
    if (!this.reader) {
      throw new Error(
        "StreamCsvReader is not opened."
      );
    }

    while (true) {
      const idx = this.buffer.indexOf("\n");

      if (idx >= 0) {
        const line = this.buffer
          .slice(0, idx)
          .replace(/\r$/, "");

        this.buffer = this.buffer.slice(idx + 1);

        return line;
      }

      const { done, value } =
        await this.reader.read();

      if (done) {
        if (!this.buffer.length) {
          return null;
        }

        const line = this.buffer.replace(
          /\r$/,
          ""
        );

        this.buffer = "";

        return line;
      }

      this.buffer += value;
    }
  }
}