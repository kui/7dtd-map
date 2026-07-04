import { throttledInvoker } from "../lib/throttled-invoker.ts";
import { printError, sleep } from "../lib/utils.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { FakeTime } from "@std/testing/time";
import { spy as fn } from "@std/testing/mock";

describe("throttledInvoker", () => {
  it("coalesces calls arriving during execution into one trailing run", async () => {
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

  it("does not schedule an extra run for calls during the throttle wait", async () => {
    using time = new FakeTime(0);
    const mockFn = fn();
    const invoker = throttledInvoker(() => {
      mockFn();
    }, 100);

    invoker().catch(printError);
    await time.tickAsync(0);
    expect(mockFn.calls.length).toBe(1);

    const second = invoker();
    await time.tickAsync(50);
    const third = invoker();
    expect(third).toBe(second);

    await time.tickAsync(200);
    expect(mockFn.calls.length).toBe(2);
    await expect(second).resolves.toBeUndefined();
  });

  it("waits intervalMs from completion of the previous run, not from its start", async () => {
    using time = new FakeTime(0);
    const events: string[] = [];
    const invoker = throttledInvoker(async () => {
      events.push(`start:${Date.now()}`);
      await sleep(50);
      events.push(`end:${Date.now()}`);
    }, 100);

    invoker().catch(printError);
    await time.tickAsync(50);
    expect(events).toEqual(["start:0", "end:50"]);

    // Second call right after completion must wait until t=150 (end + 100),
    // not t=100 (start + 100).
    invoker().catch(printError);
    await time.tickAsync(100);
    await time.tickAsync(50);
    expect(events).toEqual(["start:0", "end:50", "start:150", "end:200"]);
  });

  it("avoids parallel execution", async () => {
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

    expect(count).toBe(0);
    await expect(p).resolves.toEqual([undefined, undefined, undefined]);
  });

  it("rejects only the failing cycle and keeps serving later calls", async () => {
    using time = new FakeTime(0);
    let calls = 0;
    const invoker = throttledInvoker(async () => {
      calls++;
      await sleep(10);
      if (calls === 1) throw new Error("boom");
    }, 10);

    const first = invoker();
    // Handle the rejection before ticking; it settles inside tickAsync and
    // would otherwise be reported as an uncaught error.
    first.catch(() => {});
    await time.tickAsync(5);
    const trailing = invoker();

    // Advance enough time incrementally
    await time.tickAsync(50);
    await time.tickAsync(50);
    await time.tickAsync(50);
    await time.tickAsync(50);
    await expect(first).rejects.toThrow("boom");
    await expect(trailing).resolves.toBeUndefined();
    expect(calls).toBe(2);

    const later = invoker();
    await time.tickAsync(50);
    await time.tickAsync(50);
    await expect(later).resolves.toBeUndefined();
    expect(calls).toBe(3);
  });
});
