import { vi } from "vitest";

export function useFakeTime(now: number) {
  vi.useFakeTimers({ now });
  return {
    async tickAsync(ms: number) {
      await vi.advanceTimersByTimeAsync(ms);
    },
    [Symbol.dispose]() {
      vi.useRealTimers();
    },
  };
}
