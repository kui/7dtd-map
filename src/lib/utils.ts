export function requireNonnull<T>(t: T | undefined | null, message = () => `Unexpected state: ${t}`): T {
  if (!t) throw Error(message());
  return t;
}

export function removeAllChildren(e: HTMLElement): void {
  while (e.lastChild) {
    e.removeChild(e.lastChild);
  }
}
