import { sleep } from "./utils.ts";

export function throttledInvoker(asyncFunc: () => Promise<void> | void, intervalMs = 100): () => Promise<void> {
  const workerPromises: Promise<void>[] = [];
  let lastInvokationAt = 0;
  return () => {
    switch (workerPromises.length) {
      case 0: {
        const p = (async () => {
          const now = Date.now();
          if (now < lastInvokationAt + intervalMs) {
            await sleep(lastInvokationAt + intervalMs - now);
          }
          lastInvokationAt = Date.now();
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
          lastInvokationAt = Date.now();
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
