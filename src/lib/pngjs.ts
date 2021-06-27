import { PNG } from "pngjs/browser";

export async function pngjsByUrl(url: string): Promise<PNG> {
  return parse(await fetch(url).then((r) => r.arrayBuffer()));
}

function parse(data: ArrayBuffer): Promise<PNG> {
  return new Promise((resolve, reject) => {
    new PNG().parse(data as Buffer, (e, p) => {
      if (e) reject(e);
      else resolve(p);
    });
  });
}

export async function pngjsByBlob(blob: Blob): Promise<PNG> {
  return parse(await blob.arrayBuffer());
}
