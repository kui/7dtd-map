import { CacheHolder } from "../lib/cache-holder.ts";
import { sleep } from "../lib/utils.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { FakeTime } from "@std/testing/time";
import { spy as fn } from "@std/testing/mock";

describe("CacheHolder.get()", () => {
  it("should cache and invalidate", async () => {
    using time = new FakeTime(0);
    const fetcher = fn(() => Promise.resolve("value"));
    const deconstructor = fn((s: string) => s);
    const age = 10000;
    const holder = new CacheHolder<string>(fetcher, deconstructor, age);
    const first = holder.get();
    expect(await holder.get()).toBe("value");
    expect(await first).toBe("value");
    expect(fetcher.calls.length).toBe(1);

    await time.tickAsync(age - 1000);
    expect(await holder.get()).toBe("value");
    expect(fetcher.calls.length).toBe(1);

    expect(deconstructor.calls.length).toBe(0);

    // We want to reach T=20000.
    await time.tickAsync(age + 1000);

    expect(deconstructor.calls.length).toBe(1);

    expect(await Promise.all([holder.get(), holder.get()])).toEqual([
      "value",
      "value",
    ]);
    expect(fetcher.calls.length).toBe(2);
    holder.invalidate();
  });

  it("should raise error if fetcher throws", async () => {
    const fetcher = fn(() => {
      throw new Error("error");
    });
    const deconstructor = fn((s: string) => s);
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    await expect(holder.get()).rejects.toThrow("error");
    expect(fetcher.calls.length).toBe(1);
    expect(deconstructor.calls.length).toBe(0);
    holder.invalidate();
  });

  it("should not call deconstructor when invalidating before any get", () => {
    const fetcher = fn(() => Promise.resolve("value"));
    const deconstructor = fn((s: string) => s);
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    holder.invalidate();
    expect(fetcher.calls.length).toBe(0);
    expect(deconstructor.calls.length).toBe(0);
    holder.invalidate();
  });

  it("should refetch if the fetching is invalidated", async () => {
    using time = new FakeTime(0);
    const sleepTime = 300;
    const fetcher = fn(async () => {
      await sleep(sleepTime);
      return Promise.resolve("value");
    });
    const deconstructor = fn((s: string) => s);
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    const first = holder.get();

    await time.tickAsync(1);

    holder.invalidate();
    const second = holder.get();

    await time.tickAsync(sleepTime);
    // Extra tick for the second fetch call
    await time.tickAsync(sleepTime);

    expect(await first).toBe("value");
    expect(await second).toBe("value");
    expect(fetcher.calls.length).toBe(2);
    holder.invalidate();
  });

  it("should deconstruct values discarded by mid-fetch invalidations", async () => {
    using time = new FakeTime(0);
    const sleepTime = 300;
    let counter = 0;
    const fetcher = fn(async () => {
      const id = ++counter;
      await sleep(sleepTime);
      // Invalidate while the first fetch is still pending, so its result
      // will be discarded once it resolves.
      if (id === 1) holder.invalidate();
      return `value-${id.toString()}`;
    });
    const deconstructor = fn((_s: string) => {});
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    const first = holder.get();

    await time.tickAsync(sleepTime);
    await time.tickAsync(sleepTime);

    expect(await first).toBe("value-2");
    expect(fetcher.calls.length).toBe(2);
    // The first fetched value was discarded and must be deconstructed.
    expect(deconstructor.calls.length).toBe(1);
    expect(deconstructor.calls[0].args[0]).toBe("value-1");
    holder.invalidate();
    // After explicit invalidate, the retained final value is deconstructed too.
    expect(deconstructor.calls.length).toBe(2);
    expect(deconstructor.calls[1].args[0]).toBe("value-2");
  });

  it("should not abort refetch if deconstructor throws on discarded values", async () => {
    using time = new FakeTime(0);
    const sleepTime = 300;
    const fetcher = fn(async () => {
      await sleep(sleepTime);
      return "value";
    });
    const deconstructor = fn((_s: string) => {
      throw new Error("deconstructor failure");
    });
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    const first = holder.get();

    await time.tickAsync(1);
    holder.invalidate();

    await time.tickAsync(sleepTime);
    await time.tickAsync(sleepTime);

    expect(await first).toBe("value");
    expect(fetcher.calls.length).toBe(2);
    expect(deconstructor.calls.length).toBe(1);
  });
});
