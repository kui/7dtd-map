import throttledInvoker from "../lib/throttled-invoker";
import { sleep } from "../lib/utils";

test("throttledInvker call original function only two in a short time", async () => {
  const mockFn = jest.fn();
  const fn = throttledInvoker(async () => {
    mockFn();
    sleep(500);
  });

  fn();
  await sleep(1);
  fn();
  await sleep(1);
  await fn();
  expect(mockFn.mock.calls.length).toBe(2);

  fn();
  await sleep(1);
  fn();
  await sleep(1);
  await fn();
  expect(mockFn.mock.calls.length).toBe(4);
});
