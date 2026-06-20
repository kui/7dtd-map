/**
 * Wraps a Web Worker that is expected to post exactly one message and then
 * be discarded ("one-shot"). Listens for `message`, `error`, and
 * `messageerror`, terminates the worker on whichever event arrives first,
 * and settles the returned promise. Without this guard, an `error` or
 * `messageerror` event would leave the promise pending forever.
 *
 * The caller is responsible for `postMessage`, since some one-shot workers
 * self-initiate work on spawn and have no input message.
 *
 * By default `error` rejects with a descriptive Error and `messageerror`
 * rejects with a generic Error. Pass `onError` / `onMessageError` to
 * recover with a fallback value instead.
 */
export interface OneshotWorkerOptions<T> {
  onError?: (event: ErrorEvent) => T;
  onMessageError?: () => T;
}

export function awaitOneshotWorker<T>(
  worker: Worker,
  options: OneshotWorkerOptions<T> = {},
): Promise<T> {
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
      settle(() => {
        if (options.onError) {
          resolve(options.onError(event));
        } else {
          const { message, filename, lineno } = event;
          const detail = message || filename
            ? `${message || "error"} (${filename ?? "?"}:${lineno ?? "?"})`
            : "error";
          reject(new Error(`Worker failed: ${detail}`));
        }
      });
    });
    worker.addEventListener("messageerror", () => {
      settle(() => {
        if (options.onMessageError) {
          resolve(options.onMessageError());
        } else {
          reject(new Error("Worker message deserialization failed"));
        }
      });
    });
  });
}
