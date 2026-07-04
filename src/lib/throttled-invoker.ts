import { sleep } from "./utils.ts";

export function throttledInvoker(
  asyncFunc: () => Promise<void> | void,
  intervalMs = 100,
): () => Promise<void> {
  let running = false;
  let pending: PromiseWithResolvers<void> | null = null;
  let lastFinishedAt = -Infinity;

  const loop = async () => {
    running = true;
    try {
      while (pending) {
        const cycle = pending;
        const wait = lastFinishedAt + intervalMs - Date.now();
        if (wait > 0) await sleep(wait);
        // Cleared just before invoking: calls arriving while asyncFunc runs
        // must schedule one more cycle; calls during the wait above must not.
        pending = null;
        try {
          await asyncFunc();
          cycle.resolve();
        } catch (e) {
          cycle.reject(e);
        } finally {
          lastFinishedAt = Date.now();
        }
      }
    } finally {
      running = false;
    }
  };

  return () => {
    const cycle = (pending ??= Promise.withResolvers<void>());
    if (!running) void loop();
    return cycle.promise;
  };
}
