"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const throttled_invoker_1 = require("../lib/throttled-invoker");
const utils_1 = require("../lib/utils");
test("throttledInvker should call original function only two in a short time", async () => {
  const mockFn = jest.fn();
  const fn = (0, throttled_invoker_1.throttledInvoker)(async () => {
    mockFn();
    await (0, utils_1.sleep)(100);
  });
  fn();
  await (0, utils_1.sleep)(1);
  fn();
  await (0, utils_1.sleep)(1);
  await fn();
  expect(mockFn.mock.calls.length).toBe(2);
});
test("throttledInvker should call original function avoiding parallel", async () => {
  let count = 0;
  const fn = (0, throttled_invoker_1.throttledInvoker)(async () => {
    count++;
    expect(count).toBe(1);
    await (0, utils_1.sleep)(100);
    expect(count).toBe(1);
    count--;
  });
  await Promise.all([fn(), fn(), fn()]);
});
//# sourceMappingURL=throttled-invoker.test.js.map
