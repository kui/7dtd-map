import { PNG } from "pngjs/browser";

export interface OutMessage {
  width: number;
  height: number;
  data: ArrayBuffer;
}

onmessage = async (event: MessageEvent<ArrayBuffer>) => {
  const png = await parse(event.data);
  const m: OutMessage = {
    width: png.width,
    height: png.height,
    data: (png.data as Uint8Array).buffer,
  };
  postMessage(m, [m.data]);
};

function parse(data: ArrayBuffer): Promise<PNG> {
  return new Promise((resolve, reject) => {
    new PNG().parse(data as Buffer, (e, p) => {
      if (e) reject(e);
      else resolve(p);
    });
  });
}
