import { Buffer } from "node:buffer";
export class ByteReader {
  #iter: AsyncIterator<number>;

  constructor(stream: AsyncIterable<Buffer>) {
    // TODO Use filehandle.read(buffer) instead of async iterator for better performance.
    this.#iter = (async function* () {
      for await (const c of stream) yield* c;
    })();
  }

  async read(bytesNum: number): Promise<Buffer> {
    const b = Buffer.alloc(bytesNum);
    for (let i = 0; i < bytesNum; i++) {
      const r = await this.#iter.next();
      if (r.done) throw Error(`Unexpeted byte length: ${bytesNum.toString()}`);
      b[i] = r.value;
    }
    return b;
  }
}
