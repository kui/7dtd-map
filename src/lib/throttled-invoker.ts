export default function throttledInvoker(asyncFunc: () => Promise<void>): () => Promise<void> {
  let updateRequest = null;
  let workerPromise: Promise<void> | null = null;
  return async () => {
    updateRequest = true;

    if (workerPromise) {
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
  };
}

function waitAnimationFrame() {
  return new Promise((r) => requestAnimationFrame(r));
}
