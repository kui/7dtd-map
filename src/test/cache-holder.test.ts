import { CacheHolder } from "../lib/cache-holder";
import { sleep } from "../lib/utils";

jest.useFakeTimers({ advanceTimers: true });

describe("CacheHolder.get()", () => {
  test("should cache and invalidate", async () => {
    const fetcher = jest.fn(() => Promise.resolve("value"));
    const deconstructor = jest.fn((s: string) => s);
    const age = 10000;
    const holder = new CacheHolder<string>(fetcher, deconstructor, age);
    const first = holder.get();
    expect(await holder.get()).toBe("value");
    expect(await first).toBe("value");
    expect(fetcher.mock.calls.length).toBe(1);

    jest.advanceTimersByTime(age - 1000);
    expect(await holder.get()).toBe("value");
    expect(fetcher.mock.calls.length).toBe(1);

    expect(deconstructor.mock.calls.length).toBe(0);
    jest.advanceTimersByTime(age + 1000);
    expect(deconstructor.mock.calls.length).toBe(1);

    expect(await Promise.all([holder.get(), holder.get()])).toEqual(["value", "value"]);
    expect(fetcher.mock.calls.length).toBe(2);
  });

  test("should raise error if fetcher throws", async () => {
    const fetcher = jest.fn(() => {
      throw new Error("error");
    });
    const deconstructor = jest.fn((s: string) => s);
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    await expect(holder.get()).rejects.toThrow("error");
    expect(fetcher.mock.calls.length).toBe(1);
    expect(deconstructor.mock.calls.length).toBe(0);
  });

  test("should refetch if the fetching is invalidated", async () => {
    const sleepTime = 300;
    const fetcher = jest.fn(async () => {
      await sleep(sleepTime);
      return Promise.resolve("value");
    });
    const deconstructor = jest.fn((s: string) => s);
    const holder = new CacheHolder<string>(fetcher, deconstructor);
    const first = holder.get();

    jest.advanceTimersByTime(1);

    holder.invalidate();
    const second = holder.get();
    expect(first).toEqual(second);

    jest.advanceTimersByTime(sleepTime);

    expect(await first).toBe("value");
    expect(await second).toBe("value");
    expect(fetcher.mock.calls.length).toBe(2);
  });
});
