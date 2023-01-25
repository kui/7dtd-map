import { ImageBitmapHolder } from "../lib/image-bitmap-holder";

jest.useFakeTimers();

test("ImageBitmapHolder.get() should do fallback", async () => {
  const mockImageBitmap = { close: jest.fn() } as unknown as ImageBitmap;
  const mockCreateImageBitmap = jest.fn(async () => {
    return mockImageBitmap;
  });
  global.createImageBitmap = mockCreateImageBitmap as (i: ImageBitmapSource) => Promise<ImageBitmap>;

  const ageMsec = 1000;
  const blob = new Blob([], { type: "image/png" }) as PngBlob;
  const holder = new ImageBitmapHolder("test", blob, ageMsec);
  expect(await holder.get()).toBe(mockImageBitmap);
  expect(await holder.get()).toBe(mockImageBitmap);
  expect(mockCreateImageBitmap.mock.calls.length).toBe(1);
  expect(mockCreateImageBitmap.mock.calls[0]).toEqual([blob]);

  jest.advanceTimersByTime(ageMsec * 3);

  expect(await Promise.all([holder.get(), holder.get()])).toEqual([mockImageBitmap, mockImageBitmap]);
  expect(mockCreateImageBitmap.mock.calls.length).toBe(2);
  expect(mockCreateImageBitmap.mock.calls[1]).toEqual([blob]);
});
