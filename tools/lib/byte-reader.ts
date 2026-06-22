import { Buffer } from "node:buffer";

export class ByteReader {
  #iter: AsyncIterator<Buffer>;
  #buf: Buffer = Buffer.alloc(0);
  #offset = 0;

  constructor(stream: AsyncIterable<Buffer>) {
    this.#iter = stream[Symbol.asyncIterator]();
  }

  async read(bytesNum: number): Promise<Buffer> {
    const out = Buffer.alloc(bytesNum);
    let written = 0;
    while (written < bytesNum) {
      if (this.#offset >= this.#buf.length) {
        const r = await this.#iter.next();
        if (r.done) throw Error(`Unexpeted byte length: ${bytesNum.toString()}`);
        this.#buf = r.value;
        this.#offset = 0;
      }
      const n = Math.min(bytesNum - written, this.#buf.length - this.#offset);
      this.#buf.copy(out, written, this.#offset, this.#offset + n);
      this.#offset += n;
      written += n;
    }
    return out;
  }
}
