import { throttledInvoker } from "../lib/throttled-invoker.ts";
import { printError, sleep } from "../lib/utils.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { FakeTime } from "@std/testing/time";
import { spy as fn } from "@std/testing/mock";

describe("throttledInvoker", () => {
  it("delays the first run by at least 10ms so rapid successive calls coalesce", async () => {
    using time = new FakeTime(0);
    const mockFn = fn();
    const invoker = throttledInvoker(() => {
      mockFn();
    }, 100);

    invoker().catch(printError);
    await time.tickAsync(9);
    expect(mockFn.calls.length).toBe(0);

    const second = invoker();
    await time.tickAsync(1);
    expect(mockFn.calls.length).toBe(1);
    await expect(second).resolves.toBeUndefined();
  });

  it("coalesces calls arriving during execution into one trailing run", async () => {
    using time = new FakeTime(0);
    const mockFn = fn();
    const invoker = throttledInvoker(async () => {
      mockFn();
      await sleep(100);
    }, 100);

    invoker().catch(printError);
    await time.tickAsync(10);
    invoker().catch(printError);
    await time.tickAsync(1);
    const third = invoker();

    // WHY: split ticks let microtasks between them settle await continuations; a single large tick can hide ordering bugs.
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
    await time.tickAsync(10);
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

    // WHY: FakeTime returns Date.now() as the tick target inside an await continuation, not the timer's scheduled time, so ticks must land exactly on each due time.
    invoker().catch(printError);
    await time.tickAsync(10);
    await time.tickAsync(50);
    expect(events).toEqual(["start:10", "end:60"]);

    invoker().catch(printError);
    await time.tickAsync(100);
    await time.tickAsync(50);
    expect(events).toEqual(["start:10", "end:60", "start:160", "end:210"]);
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
    // WHY: attach the rejection handler before ticking so it settles inside tickAsync without being reported as an uncaught error.
    first.catch(() => {});
    // WHY: at t=15 the first run started at t=10 and is still executing, so this call schedules a trailing cycle instead of joining the first one.
    await time.tickAsync(15);
    const trailing = invoker();

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
