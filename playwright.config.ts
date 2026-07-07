import { defineConfig, devices } from "@playwright/test";

const PORT = Number(Deno.env.get("PORT") ?? 18234);
const HOST = Deno.env.get("HOST") ?? "127.0.0.1";
const CI = Deno.env.get("CI");
const baseURL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  // The bundled-map load test fetches ~5MB of assets through the dev server.
  // Cap workers to keep server contention bounded even though serve:static is
  // sturdier than esbuild's serve under load.
  workers: CI ? 1 : 2,
  reporter: CI ? [["html", { open: "never" }], ["list"]] : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `deno task serve:static`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !CI,
    env: {
      PORT: String(PORT),
      HOST,
    },
    stdout: "pipe",
    stderr: "pipe",
  },
});
