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
        const wait = Math.max(10, lastFinishedAt + intervalMs - Date.now());
        await sleep(wait);
        // INVARIANT: clear pending just before invoking so calls arriving while asyncFunc runs schedule one more cycle, while calls during the wait above coalesce into this one.
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
