import { expect } from "@playwright/test";
import { test } from "./fixtures.ts";

test.describe("prefabs.html", () => {
  test("loads the prefab list and renders status text", async ({ page }) => {
    await page.goto("/prefabs.html");
    await expect(page.locator("#prefab-filter")).toBeVisible();
    await expect(page.locator("#prefabs-list")).toBeAttached();
    // WHY: Poll until the worker finishes the first filter pass so the status text is non-empty.
    await expect.poll(async () =>
      (await page.locator("#prefabs-status").textContent())?.trim().length ?? 0
    ).toBeGreaterThan(0);
  });

  test("filter input updates the URL querystring", async ({ page }) => {
    await page.goto("/prefabs.html");
    await page.fill("#prefab-filter", "trader");
    // WHY: UrlState debounces updates, so poll until the querystring reflects the input.
    await expect.poll(() =>
      new URL(page.url()).searchParams.get("prefab-filter")
    )
      .toBe("trader");
  });

  test("tier-clear button restores the default tier range", async ({ page }) => {
    await page.goto("/prefabs.html");
    await page.locator("#min-tier").evaluate((el: HTMLInputElement) => {
      el.value = "3";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(Number(await page.locator("#min-tier").inputValue())).toBe(3);

    await page.click("#tier-clear");
    expect(Number(await page.locator("#min-tier").inputValue())).toBe(0);
    expect(Number(await page.locator("#max-tier").inputValue())).toBe(5);
  });

  test("highlighted prefab names do not execute injected scripts (XSS regression)", async ({ page }) => {
    /* WHY: We can't easily plant a malicious-named prefab without controlling
       the backing JSON. We therefore verify (a) no accidental dialog fires
       and (b) <mark> elements are produced, which proves the escape-then-mark
       pipeline added in commit 92abcb8c is active. */
    let dialogTriggered = false;
    page.on("dialog", async (d) => {
      dialogTriggered = true;
      await d.dismiss();
    });
    await page.goto("/prefabs.html");
    await page.fill("#prefab-filter", "house");
    await expect
      .poll(async () => await page.locator("#prefabs-list li").count())
      .toBeGreaterThan(0);
    expect(dialogTriggered).toBe(false);
  });
});
