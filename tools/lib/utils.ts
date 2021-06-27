export function requireNonnull<T>(a: T | null | undefined, message = "Unexpected error"): T {
  if (a) return a;
  else throw Error(message);
}

export function handleMain(main: Promise<number>): void {
  main
    .catch((e) => {
      console.error(e);
      return 1;
    })
    .then((exitCode) => {
      process.on("exit", () => process.exit(exitCode));
    });
}
