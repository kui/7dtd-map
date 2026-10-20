import { CacheHolder } from "../lib/cache-holder.ts";
import { sleep } from "../lib/utils.ts";
import { describe, expect, it, vi } from "vitest";
import { useFakeTime } from "./fake-time.ts";

describe("CacheHolder.get()", () => {
  it("should cache and invalidate", async () => {
    using time = useFakeTime(0);
    const fetcher = vi.fn(() => Promise.resolve("value"));
    const deconstructor = vi.fn((s: string) => s);
    const age = 10000;
    const holder = new CacheHolder<string>(fetcher, deconstructor, age);
    const first = holder.get();
    expect(await holder.get()).toBe("value");
    expect(await first).toBe("value");
    expect(fetcher.mock.calls.length).toBe(1);

    await time.tickAsync(age - 1000);
    expect(await holder.get()).toBe("value");
    expect(fetcher.mock.calls.length).toBe(1);

    expect(deconstructor.mock.calls.length).toBe(0);

    await time.tickAsync(age + 1000);

    expect(deconstructor.mock.calls.length).toBe(1);

    expect(await Promise.all([holder.get(), holder.get()])).toEqual([
      "value",
      "value",
    ]);
    expect(fetcher.mock.calls.length).toBe(2);
    holder.invalidate();
  });

  it("should raise error if fetcher throws", async () => {
    const fetcher = vi.fn(() => {
      throw new Error("error");
    });
    const deconstructor = vi.fn((s: string) => s);
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    await expect(holder.get()).rejects.toThrow("error");
    expect(fetcher.mock.calls.length).toBe(1);
    expect(deconstructor.mock.calls.length).toBe(0);
    holder.invalidate();
  });

  it("should not call deconstructor when invalidating before any get", () => {
    const fetcher = vi.fn(() => Promise.resolve("value"));
    const deconstructor = vi.fn((s: string) => s);
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    holder.invalidate();
    expect(fetcher.mock.calls.length).toBe(0);
    expect(deconstructor.mock.calls.length).toBe(0);
    holder.invalidate();
  });

  it("should refetch if the fetching is invalidated", async () => {
    using time = useFakeTime(0);
    const sleepTime = 300;
    const fetcher = vi.fn(async () => {
      await sleep(sleepTime);
      return Promise.resolve("value");
    });
    const deconstructor = vi.fn((s: string) => s);
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    const first = holder.get();

    await time.tickAsync(1);

    holder.invalidate();
    const second = holder.get();

    await time.tickAsync(sleepTime);
    await time.tickAsync(sleepTime);

    expect(await first).toBe("value");
    expect(await second).toBe("value");
    expect(fetcher.mock.calls.length).toBe(2);
    holder.invalidate();
  });

  it("should deconstruct values discarded by mid-fetch invalidations", async () => {
    using time = useFakeTime(0);
    const sleepTime = 300;
    let counter = 0;
    const fetcher = vi.fn(async () => {
      const id = ++counter;
      await sleep(sleepTime);
      // WHY: invalidate mid-fetch so the first result is discarded once it resolves.
      if (id === 1) holder.invalidate();
      return `value-${id.toString()}`;
    });
    const deconstructor = vi.fn((_s: string) => {});
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    const first = holder.get();

    await time.tickAsync(sleepTime);
    await time.tickAsync(sleepTime);

    expect(await first).toBe("value-2");
    expect(fetcher.mock.calls.length).toBe(2);
    expect(deconstructor.mock.calls.length).toBe(1);
    expect(deconstructor.mock.calls[0][0]).toBe("value-1");
    holder.invalidate();
    expect(deconstructor.mock.calls.length).toBe(2);
    expect(deconstructor.mock.calls[1][0]).toBe("value-2");
  });

  it("should not abort refetch if deconstructor throws on discarded values", async () => {
    using time = useFakeTime(0);
    const sleepTime = 300;
    const fetcher = vi.fn(async () => {
      await sleep(sleepTime);
      return "value";
    });
    const deconstructor = vi.fn((_s: string) => {
      throw new Error("deconstructor failure");
    });
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    const first = holder.get();

    await time.tickAsync(1);
    holder.invalidate();

    await time.tickAsync(sleepTime);
    await time.tickAsync(sleepTime);

    expect(await first).toBe("value");
    expect(fetcher.mock.calls.length).toBe(2);
    expect(deconstructor.mock.calls.length).toBe(1);
  });
});
