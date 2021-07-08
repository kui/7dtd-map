interface ObjectConstructor {
  entries<T>(o: T): Entry<T>[];
}

type Entry<T> = NonNullable<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;

interface PngBlob extends Blob {
  type: "image/png";
}
