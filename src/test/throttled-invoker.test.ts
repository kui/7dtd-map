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

  it("should wait intervalMs from completion, not from start", async () => {
    using time = new FakeTime(0);
    const events: string[] = [];

    // asyncFunc takes 50ms; intervalMs=100
    const invoker = throttledInvoker(async () => {
      events.push(`start:${Date.now()}`);
      await sleep(50);
      events.push(`end:${Date.now()}`);
    }, 100);

    // First call at t=0. Initial lastCompletionAt=0, so sleeps 100ms.
    // asyncFunc runs t=100..150, completion recorded at t=150.
    invoker().catch(printError);
    await time.tickAsync(100); // t=100: initial sleep resolves, asyncFunc starts
    await time.tickAsync(50); // t=150: asyncFunc completes, lastCompletionAt=150

    expect(events).toEqual(["start:100", "end:150"]);

    // Second call at t=150. lastCompletionAt=150, so needs to wait until t=250.
    // With start-based logic (old), last start was t=100 so wait until t=200.
    invoker().catch(printError);
    await time.tickAsync(100); // t=250: sleep resolves, second asyncFunc starts
    await time.tickAsync(50); // t=300: second asyncFunc completes

    expect(events).toEqual([
      "start:100",
      "end:150",
      "start:250", // 100ms after completion(150), not after start(100)
      "end:300",
    ]);
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
