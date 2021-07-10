import { waitAnimationFrame } from "./utils";

export function throttledInvoker(asyncFunc: () => Promise<void>): () => Promise<void> {
  let workerPromise: Promise<void> | null = null;
  let isDirty = false;
  return () => {
    isDirty = true;

    if (workerPromise) {
      return workerPromise.then(() => {
        if (isDirty) {
          return (workerPromise = (async () => {
            isDirty = false;
            await waitAnimationFrame();
            await asyncFunc();
            workerPromise = null;
          })());
        }
      });
    }

    return (workerPromise = (async () => {
      isDirty = false;
      await asyncFunc();
      workerPromise = null;
    })());
  };
}
