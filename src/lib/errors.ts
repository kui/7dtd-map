export class MultipleErrors extends Error {
  #causes;
  constructor(errors: unknown[]) {
    super("Multiple errors occurred");
    this.#causes = errors;
  }

  get causes() {
    return this.#causes;
  }
}
