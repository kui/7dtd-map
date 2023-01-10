import { throttledInvoker } from "../lib/throttled-invoker";
import { sleep } from "../lib/utils";

test("throttledInvker should call original function only two in a short time", async () => {
  const mockFn = jest.fn();
  const fn = throttledInvoker(async () => {
    mockFn();
    await sleep(100);
  });

  fn();
  await sleep(1);
  fn();
  await sleep(1);
  await fn();
  expect(mockFn.mock.calls.length).toBe(2);
});

test("throttledInvker should call original function avoiding parallel", async () => {
  let count = 0;
  const fn = throttledInvoker(async () => {
    count++;
    expect(count).toBe(1);
    await sleep(100);
    expect(count).toBe(1);
    count--;
  });

  await Promise.all([fn(), fn(), fn()]);
});
