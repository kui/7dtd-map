import { jest } from "bun:test";

async function flushMicrotasks() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

export function useFakeTime(now: number) {
  jest.useFakeTimers({ now });
  return {
    // WHY: bun:test has no async tick, so step 1 ms at a time and let awaited continuations run between steps.
    async tickAsync(ms: number) {
      await flushMicrotasks();
      for (let i = 0; i < ms; i++) {
        jest.advanceTimersByTime(1);
        await flushMicrotasks();
      }
    },
    [Symbol.dispose]() {
      jest.useRealTimers();
    },
  };
}
