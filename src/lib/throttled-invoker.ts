import { waitAnimationFrame } from "./utils";

export default function throttledInvoker(asyncFunc: () => Promise<void>): () => Promise<void> {
  let updateRequest = false;
  let workerPromise: Promise<void> | null = null;
  return async () => {
    updateRequest = true;

    if (workerPromise) {
      await workerPromise;
      return;
    }

    workerPromise = (async () => {
      while (updateRequest) {
        updateRequest = false;
        await asyncFunc();
        await waitAnimationFrame();
      }
      workerPromise = null;
    })();
    await workerPromise;
  };
}
