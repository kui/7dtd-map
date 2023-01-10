import * as pngjsWorker from "../worker/pngjs";

export interface Png {
  width: number;
  height: number;
  data: ArrayBuffer;
}

export class PngParser {
  private workerFactory: () => Worker;

  constructor(workerFactory: () => Worker) {
    this.workerFactory = workerFactory;
  }

  async parse(blob: Blob): Promise<Png> {
    const worker = this.workerFactory();
    const data = await blob.arrayBuffer();
    worker.postMessage(data, [data]);
    const event: MessageEvent<pngjsWorker.OutMessage> = await new Promise((resolve, reject) => {
      worker.onmessage = resolve;
      worker.onerror = reject;
      worker.onmessageerror = reject;
    });
    worker.terminate();
    return event.data;
  }
}
