import { sleep } from "./utils.ts";

export function throttledInvoker(
  asyncFunc: () => Promise<void> | void,
  intervalMs = 100,
): () => Promise<void> {
  const workerPromises: Promise<void>[] = [];
  let lastCompletionAt = 0;
  return () => {
    switch (workerPromises.length) {
      case 0: {
        const p = (async () => {
          const now = Date.now();
          if (now < lastCompletionAt + intervalMs) {
            await sleep(lastCompletionAt + intervalMs - now);
          }
          try {
            await asyncFunc();
          } finally {
            lastCompletionAt = Date.now();
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
            lastCompletionAt = Date.now();
            void workerPromises.shift();
          }
        })();
        workerPromises.push(p);
        return p;
      }
      case 2:
        // deno-lint-ignore no-non-null-assertion
        return workerPromises[1]!;
      default:
        throw Error(
          `Unexpected state: promiceses=${workerPromises.length.toString()}`,
        );
    }
  };
}
