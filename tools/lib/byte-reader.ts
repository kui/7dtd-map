import * as fs from "fs";

export class ByteReader {
  iter: AsyncIterator<number>;

  constructor(stream: fs.ReadStream) {
    this.iter = (async function* () {
      for await (const c of stream) {
        for (const b of c as Buffer) {
          yield b;
        }
      }
    })();
  }

  async read(bytesNum: number): Promise<Buffer> {
    const b = Buffer.alloc(bytesNum);
    for (let i = 0; i < bytesNum; i++) {
      const r = await this.iter.next();
      if (r.done) throw Error(`Unexpeted byte length: ${bytesNum}`);
      b[i] = r.value;
    }
    return b;
  }
}
