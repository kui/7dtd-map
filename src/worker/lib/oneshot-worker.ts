/**
 * Worker-side of the one-shot worker framework. A "one-shot" worker waits
 * for a single input message, does work, posts one result, and exits.
 *
 * Errors thrown inside `main` are logged in full (object + stack) by
 * printError, then surfaced to the main thread as a typed failure
 * sentinel. The main-thread wrapper (`runOneshotWorker`) throws on that
 * sentinel — the rich error has already been logged here, so the
 * main-thread Error is only a control-flow signal.
 */
import { printError } from "../../lib/utils.ts";
import type { OneshotWorkerResult } from "../../lib/oneshot-worker.ts";

/**
 * Register the one-shot message handler. Runs `main` exactly once on
 * receipt of the input message, posts the result back, and closes the
 * worker.
 *
 * `getTransfer` returns Transferable objects owned by the result so large
 * buffers can be moved without copying.
 */
export function handleOneshotWorker<TIn, TOut>(
  main: (input: TIn) => TOut | Promise<TOut>,
  getTransfer: (value: TOut) => Transferable[] = () => [],
): void {
  self.onmessage = async (event: MessageEvent<TIn>) => {
    let result: OneshotWorkerResult<TOut>;
    let transfer: Transferable[] = [];
    try {
      const value = await main(event.data);
      result = { ok: true, value };
      transfer = getTransfer(value);
    } catch (e) {
      printError(e);
      result = { ok: false };
    }
    self.postMessage(result, transfer);
    self.close();
  };
}
