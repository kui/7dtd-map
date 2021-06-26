export function requireNonnull<T>(a: T | null | undefined, message = "Unexpected error"): T {
  if (a) return a;
  else throw Error(message);
}
