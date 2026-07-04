import { sleep } from "./utils.ts";

export function throttledInvoker(
  asyncFunc: () => Promise<void> | void,
  intervalMs = 100,
): () => Promise<void> {
  let tail: Promise<void> = Promise.resolve();
  let pendingCount = 0;
  let lastCompletionAt = 0;

  return () => {
    if (pendingCount >= 2) return tail;
    pendingCount++;
    return (tail = tail.catch(() => {}).then(async () => {
      const now = Date.now();
      if (now < lastCompletionAt + intervalMs) {
        await sleep(lastCompletionAt + intervalMs - now);
      }
      try {
        await asyncFunc();
      } finally {
        lastCompletionAt = Date.now();
        pendingCount--;
      }
    }));
  };
}
