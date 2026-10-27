import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/test/**/*.test.ts", "tools/test/**/*.test.ts"],
    // WHY: `test:changed` (pre-commit) only runs tests that import a changed file; node-version-sync.test.ts reads mise.toml without importing it.
    forceRerunTriggers: [...configDefaults.forceRerunTriggers, "**/mise.toml"],
  },
});
