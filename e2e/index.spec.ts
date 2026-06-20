import { expect, test } from "@playwright/test";

test.describe("index.html", () => {
  test("renders the main controls", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page.locator("#map_name")).toBeVisible();
    await expect(page.locator("#prefabs_list")).toBeAttached();
    await expect(page.locator("#min_tier")).toBeVisible();
    await expect(page.locator("#max_tier")).toBeVisible();
    await expect(page.locator("#prefab_filter")).toBeVisible();
    await expect(page.locator("#block_filter")).toBeVisible();
    await expect(page.locator("#label_lang")).toBeVisible();
    await expect(page.locator("#download")).toBeVisible();
  });

  test("language select change is persisted in localStorage", async ({ page }) => {
    await page.goto("/index.html");
    // The label_lang select is populated asynchronously by LabelHandler; wait
    // for at least one extra option to appear beyond the default.
    await expect
      .poll(async () =>
        await page.locator("#label_lang option").count()
      )
      .toBeGreaterThan(1);

    await page.selectOption("#label_lang", "japanese");
    await expect
      .poll(async () =>
        await page.evaluate(() => localStorage.getItem("language"))
      )
      .toBe("japanese");
  });

  test("min_tier cannot exceed max_tier — they correct each other", async ({ page }) => {
    await page.goto("/index.html");
    // Set min above current max; min-max-inputs.ts should drag max up so
    // max >= min.
    await page.locator("#max_tier").evaluate((el: HTMLInputElement) => {
      el.value = "2";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("#min_tier").evaluate((el: HTMLInputElement) => {
      el.value = "4";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const maxValue = await page.locator("#max_tier").inputValue();
    expect(Number(maxValue)).toBeGreaterThanOrEqual(4);
  });

  test("prefab inspector dialog opens and closes", async ({ page }) => {
    await page.goto("/index.html");
    const dialog = page.locator("#prefab-inspector-dialog");
    await expect(dialog).toBeAttached();
    await expect(dialog).not.toHaveAttribute("open", /.*/);

    await page.click("#prefab-inspector-show");
    await expect(dialog).toHaveAttribute("open", /.*/);

    await page.click("[data-close-dialog-for=\"prefab-inspector-dialog\"]");
    await expect(dialog).not.toHaveAttribute("open", /.*/);
  });
});
