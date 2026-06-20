/**
 * Main-thread side of the one-shot worker framework. Pair with
 * `handleOneshotWorker` in `src/worker/lib/oneshot-worker.ts`. See that
 * module for the design rationale.
 */

/**
 * Wire-format result that the worker posts back. Shared between the
 * worker-side and main-thread modules.
 */
export type OneshotWorkerResult<T> = { ok: true; value: T } | { ok: false };

/**
 * Post `input` to a one-shot worker and await its single result message.
 * Terminates the worker on any outcome. Throws if the worker reported
 * failure (the rich error was already logged in the worker console via
 * printError) or died before responding.
 */
export async function runOneshotWorker<TIn, TOut>(
  worker: Worker,
  input: TIn,
): Promise<TOut> {
  const promise = awaitOneshotWorker<OneshotWorkerResult<TOut>>(worker);
  worker.postMessage(input);
  const result = await promise;
  if (!result.ok) throw new Error("Worker reported failure");
  return result.value;
}

function awaitOneshotWorker<T>(worker: Worker): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      worker.terminate();
      fn();
    };
    worker.addEventListener("message", (event: MessageEvent<T>) => {
      settle(() => resolve(event.data));
    });
    worker.addEventListener("error", (event) => {
      // Prevent the browser from also logging an "Uncaught" notice for an
      // error we are about to surface through the promise.
      event.preventDefault();
      const { message, filename, lineno } = event;
      const detail = message || filename
        ? `${message || "error"} (${filename ?? "?"}:${lineno ?? "?"})`
        : "error";
      settle(() => reject(new Error(`Worker failed: ${detail}`)));
    });
    worker.addEventListener("messageerror", () => {
      settle(() => reject(new Error("Worker message deserialization failed")));
    });
  });
}
