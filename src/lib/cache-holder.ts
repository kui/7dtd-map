const NO_VALUE = Symbol("NO_VALUE");
type NoValue = typeof NO_VALUE;

/**
 * A holder for a cached value.
 *
 * The cache is invalidated after `age` since the last access.
 */
export class CacheHolder<T> {
  #fetcher: () => Promise<T>;
  #deconstructor: (value: T) => unknown;
  #age: number;

  #value: T | NoValue = NO_VALUE;
  #fetchPromise: Promise<T> | null = null;
  #expirationTimeout: ReturnType<typeof setTimeout> | null = null;
  #lastInvalidation = Date.now();

  constructor(fetcher: () => Promise<T>, deconstructor: (value: T) => unknown, age = 10000) {
    this.#fetcher = fetcher;
    this.#deconstructor = deconstructor;
    this.#age = age;
  }

  /**
   * Get the value from the cache.
   *
   * If the value is not in the cache, it is fetched and stored.
   */
  get(): Promise<T> {
    const p = this.#value === NO_VALUE ? this.#fetch() : Promise.resolve(this.#value);
    p.finally(() => {
      this.#resetTimer();
    }).catch(() => {
      // ignore
    });
    return p;
  }

  #fetch(): Promise<T> {
    if (this.#fetchPromise) return this.#fetchPromise;

    const p = (async () => {
      const promise = this.#fetchUntilNoInvalidation();
      try {
        this.#value = await promise;
        return this.#value;
      } finally {
        this.#fetchPromise = null;
      }
    })();

    this.#fetchPromise = p;
    return p;
  }

  async #fetchUntilNoInvalidation(): Promise<T> {
    let now: number;
    let value: T;
    do {
      now = Date.now();
      value = await this.#fetcher();
    } while (now < this.#lastInvalidation);
    return value;
  }

  /**
   * Invalidate the cache.
   */
  invalidate() {
    if (this.#value !== NO_VALUE) {
      this.#deconstructor(this.#value);
      this.#value = NO_VALUE;
    }
    if (this.#expirationTimeout) clearTimeout(this.#expirationTimeout);
    this.#expirationTimeout = null;
    this.#lastInvalidation = Date.now();
  }

  #resetTimer() {
    if (this.#expirationTimeout) clearTimeout(this.#expirationTimeout);
    this.#expirationTimeout = setTimeout(() => {
      this.invalidate();
    }, this.#age);
  }
}
