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
});
