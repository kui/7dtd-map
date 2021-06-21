export default function lazyInvoke(window, asyncFunc) {
  let updateRequest = null;
  let workerPromise = null;
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

function waitAnimationFrame(w) {
  return new Promise((r) => w.requestAnimationFrame(r));
}
