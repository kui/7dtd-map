import { throttledInvoker } from "../lib/throttled-invoker";
import { printError, sleep } from "../lib/utils";
import { setImmediate } from "timers/promises";

jest.useFakeTimers({ doNotFake: ["setImmediate"] });

describe("throttledInvoker", () => {
  test("should call original function only twice even if 3 invokation in a short time", async () => {
    const mockFn = jest.fn();
    const fn = throttledInvoker(async () => {
      mockFn();
      await sleep(100);
    }, 100);

    fn().catch(printError);
    jest.advanceTimersByTime(1);
    fn().catch(printError);
    jest.advanceTimersByTime(1);
    const third = fn();
    await advanceTimers(100, 3);
    expect(mockFn.mock.calls.length).toBe(2);
    await expect(third).resolves.toBeUndefined();
  });

  test("should call original function avoiding parallel", async () => {
    let count = 0;
    const fn = throttledInvoker(async () => {
      count++;
      expect(count).toBe(1);
      await sleep(100);
      expect(count).toBe(1);
      count--;
    });
    const p = Promise.all([fn(), fn(), fn()]);
    await advanceTimers(100, 3);
    await expect(p).resolves.toEqual([undefined, undefined, undefined]);
  });
});

async function advanceTimers(ms: number, times = 1) {
  for (let i = 0; i < times; i++) {
    jest.advanceTimersByTime(ms);
    await setImmediate();
  }
}
