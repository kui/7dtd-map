import { sleep } from "./utils";

export function throttledInvoker(asyncFunc: () => Promise<void> | void, intervalMs = 100): () => Promise<void> {
  const workerPromises: Promise<void>[] = [];
  return () => {
    switch (workerPromises.length) {
      case 0: {
        const p = (async () => {
          try {
            await asyncFunc();
          } finally {
            void workerPromises.shift();
          }
        })();
        workerPromises.push(p);
        return p;
      }
      case 1: {
        const prev = workerPromises[0];
        const p = (async () => {
          await prev;
          await sleep(intervalMs);
          try {
            await asyncFunc();
          } finally {
            void workerPromises.shift();
          }
        })();
        workerPromises.push(p);
        return p;
      }
      case 2:
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return workerPromises[1]!;
      default:
        throw Error(`Unexpected state: promiceses=${workerPromises.length.toString()}`);
    }
  };
}
