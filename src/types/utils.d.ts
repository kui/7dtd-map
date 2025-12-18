interface NumberRange {
  start: number;
  end: number;
}

type ObjectEntries<T> = (keyof T extends infer U ? (U extends keyof T ? [U, T[U]] : never) : never)[];
