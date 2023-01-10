"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const image_bitmap_holder_1 = require("../lib/image-bitmap-holder");
jest.useFakeTimers();
test("ImageBitmapHolder.get() should do fallback", async () => {
  const mockImageBitmap = { close: jest.fn() };
  const mockCreateImageBitmap = jest.fn(async () => {
    return mockImageBitmap;
  });
  global.createImageBitmap = mockCreateImageBitmap;
  const ageMsec = 1000;
  const blob = new Blob([], { type: "image/png" });
  const holder = new image_bitmap_holder_1.ImageBitmapHolder("test", blob, ageMsec);
  expect(await holder.get()).toBe(mockImageBitmap);
  expect(await holder.get()).toBe(mockImageBitmap);
  expect(mockCreateImageBitmap.mock.calls.length).toBe(1);
  expect(mockCreateImageBitmap.mock.calls[0]).toEqual([blob]);
  jest.advanceTimersByTime(ageMsec * 3);
  expect(await Promise.all([holder.get(), holder.get()])).toEqual([mockImageBitmap, mockImageBitmap]);
  expect(mockCreateImageBitmap.mock.calls.length).toBe(2);
  expect(mockCreateImageBitmap.mock.calls[1]).toEqual([blob]);
});
//# sourceMappingURL=image-bitmap-holder.test.js.map
