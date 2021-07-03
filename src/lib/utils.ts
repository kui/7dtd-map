export function requireNonnull<T>(t: T | undefined | null, message = () => `Unexpected state: ${t}`): T {
  if (t) return t;
  else throw Error(message());
}

export function requireType<T>(o: unknown, t: { new (...a: unknown[]): T }, message = () => `Unexpected type: ${o}`): T {
  if (o instanceof t) return o;
  throw Error(message());
}

export function component<T extends HTMLElement>(id: string, t: { new (...a: unknown[]): T }): T {
  return requireType(requireNonnull(document.getElementById(id)), t);
}

export function removeAllChildren(e: HTMLElement): void {
  while (e.lastChild) {
    e.removeChild(e.lastChild);
  }
}

export function assignAll<T>(t: T, other: Partial<T>): T {
  for (const n in t) {
    if (n in other) {
      t[n] = other[n] as T[Extract<keyof T, string>];
    }
  }
  return t;
}

export function humanreadableDistance(d: number): string {
  if (d < 1000) {
    return `${d}m`;
  }
  return `${(d / 1000).toFixed(2)}km`;
}
