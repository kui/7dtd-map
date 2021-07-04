type Listener<T> = (data: T) => Promise<void> | void;

export class Channel<T> {
  private listeners: Listener<T>[] = [];

  subscribe(listener: Listener<T>): void {
    this.listeners.push(listener);
  }

  async push(data: T): Promise<void> {
    await Promise.all(this.listeners.map((fn) => fn(data)));
  }
}
