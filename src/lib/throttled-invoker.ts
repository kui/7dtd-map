import { waitAnimationFrame } from "./utils";

export function throttledInvoker(asyncFunc: () => Promise<void> | void): () => Promise<void> {
  const workerPromises: Promise<void>[] = [];
  return () => {
    switch (workerPromises.length) {
      case 0: {
        workerPromises.push(
          (async () => {
            await asyncFunc();
            workerPromises.shift();
          })()
        );
        return workerPromises[0];
      }
      case 1: {
        const prev = workerPromises[0];
        workerPromises.push(
          (async () => {
            await prev;
            await waitAnimationFrame();
            await asyncFunc();
            workerPromises.shift();
          })()
        );
        return workerPromises[1];
      }
      case 2:
        return workerPromises[1];
      default:
        throw Error(`Unexpected state: promiceses=${workerPromises.length}`);
    }
  };
}
