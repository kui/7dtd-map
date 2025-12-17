import { throttledInvoker } from "../lib/throttled-invoker.ts";
import { printError, sleep } from "../lib/utils.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { FakeTime } from "@std/testing/time";
import { spy as fn } from "@std/testing/mock";

describe("throttledInvoker", () => {
  it("should call original function only twice even if 3 invokation in a short time", async () => {
    using time = new FakeTime(0);
    const mockFn = fn();
    const invoker = throttledInvoker(async () => {
      mockFn();
      await sleep(100);
    }, 100);

    invoker().catch(printError);
    await time.tickAsync(1);
    invoker().catch(printError);
    await time.tickAsync(1);
    const third = invoker();

    // Advance enough time incrementally
    await time.tickAsync(200);
    await time.tickAsync(200);
    await time.tickAsync(200);
    await time.tickAsync(200);

    expect(mockFn.calls.length).toBe(2);
    await expect(third).resolves.toBeUndefined();
  });

  it("should call original function avoiding parallel", async () => {
    using time = new FakeTime(0);
    let count = 0;
    const invoker = throttledInvoker(async () => {
      count++;
      expect(count).toBe(1);
      await sleep(100);
      expect(count).toBe(1);
      count--;
    });
    const p = Promise.all([invoker(), invoker(), invoker()]);
    await time.tickAsync(200);
    await time.tickAsync(200);
    await time.tickAsync(200);
    await time.tickAsync(200);

    await expect(p).resolves.toEqual([undefined, undefined, undefined]);
  });
});
