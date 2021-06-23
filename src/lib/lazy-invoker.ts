export default function lazyInvoke(window: any, asyncFunc: any) {
  let updateRequest = null;
  let workerPromise: any = null;
  return async () => {
    updateRequest = true;

    if (workerPromise) {
      return;
    }

    workerPromise = (async () => {
      while (updateRequest) {
        updateRequest = false;
        await asyncFunc();
        await waitAnimationFrame(window);
      }
      workerPromise = null;
    })();
  };
}

function waitAnimationFrame(w: any) {
  return new Promise((r) => w.requestAnimationFrame(r));
}
