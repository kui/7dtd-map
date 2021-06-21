export default function lazyInvoke(window: any, asyncFunc: any) {
  let updateRequest = null;
  let workerPromise: any = null;
  return async () => {
    updateRequest = true;

    if (workerPromise) {
      return;
    }

    workerPromise = (async () => {
      /* eslint-disable no-await-in-loop */
      while (updateRequest) {
        updateRequest = false;
        await asyncFunc();
        await waitAnimationFrame(window);
      }
      /* eslint-enable no-await-in-loop */
      workerPromise = null;
    })();
  };
}

function waitAnimationFrame(w: any) {
  return new Promise((r) => w.requestAnimationFrame(r));
}
