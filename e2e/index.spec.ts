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
      .poll(async () => await page.locator("#label_lang option").count())
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

  test("loading and filtering the bundled Navezgane map", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/index.html");

    // Wait for the bundled-map select to be populated.
    await expect
      .poll(async () =>
        await page.locator("#bundled_map_select option").count()
      )
      .toBeGreaterThan(1);

    // Install an observer that latches when the load/processing dialog opens.
    // The dialog is opened via showModal() and closed once processing
    // finishes, so a plain poll can race past the open window.
    await page.evaluate(() => {
      const w = globalThis as unknown as { __dialogWasOpen?: boolean };
      w.__dialogWasOpen = false;
      const dialog = document.getElementById("dialog") as HTMLDialogElement;
      new MutationObserver(() => {
        if (dialog.open) w.__dialogWasOpen = true;
      }).observe(dialog, { attributes: true, attributeFilter: ["open"] });
    });

    await page.selectOption("#bundled_map_select", "Navezgane");

    // Loading dialog should have been open at some point during processing.
    await expect
      .poll(async () =>
        await page.evaluate(() =>
          (globalThis as unknown as { __dialogWasOpen?: boolean })
            .__dialogWasOpen ?? false
        )
      )
      .toBe(true);

    // Canvas dimensions: Navezgane HeightMapSize is 6144x6144 and the default
    // render scale is 0.12 -> 6144 * 0.12 = 737.28 -> 737. Map processing can
    // take a few seconds under parallel test load, so widen the poll window.
    const slow = { timeout: 20_000 };
    await expect.poll(
      async () =>
        await page.locator("#map").evaluate((c: HTMLCanvasElement) => c.width),
      slow,
    ).toBe(737);
    await expect.poll(
      async () =>
        await page.locator("#map").evaluate((c: HTMLCanvasElement) => c.height),
      slow,
    ).toBe(737);

    // Prefab list is populated.
    await expect.poll(
      async () => await page.locator("#prefabs_list li").count(),
      slow,
    ).toBeGreaterThan(0);

    // Map name input reflects the selection.
    await expect.poll(
      async () => await page.locator("#map_name").inputValue(),
      slow,
    ).toBe("Navezgane");

    // Apply the "trader" prefab-filter preset.
    await page.click(
      'button[data-input-for="prefab_filter"]:text-is("trader")',
    );
    await expect.poll(async () =>
      await page.locator("#prefab_filter").inputValue()
    ).toBe("trader");
    await expect.poll(async () =>
      await page.locator("#prefabs_list li").count()
    ).toBeGreaterThan(0);

    // Clear the prefab filter via its X button (data-input-text="").
    await page.click(
      'button[data-input-for="prefab_filter"][data-input-text=""]',
    );
    await expect.poll(async () =>
      await page.locator("#prefab_filter").inputValue()
    ).toBe("");

    // Apply the "Super Corn" block-filter preset.
    await page.click(
      'button[data-input-for="block_filter"]:text-is("Super Corn")',
    );
    await expect.poll(async () =>
      await page.locator("#block_filter").inputValue()
    ).toBe("(Grace|Super)Corn");
    await expect.poll(async () =>
      await page.locator("#prefabs_list li").count()
    ).toBeGreaterThan(0);

    // Narrow the tier range to [0, 0]; with Super Corn still in the block
    // filter, no prefab should match.
    await page.locator("#max_tier").evaluate((el: HTMLInputElement) => {
      el.value = "0";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("#min_tier").evaluate((el: HTMLInputElement) => {
      el.value = "0";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect.poll(async () =>
      await page.locator("#prefabs_list li").count()
    ).toBe(0);
  });

  test("terrain viewer dialog is wired up with a11y attributes", async ({ page }) => {
    await page.goto("/index.html");
    const dialog = page.locator("#terrain_viewer_dialog");
    await expect(dialog).toBeAttached();
    await expect(dialog).not.toHaveAttribute("open", /.*/);
    await expect(dialog).toHaveAttribute(
      "aria-labelledby",
      "terrain_viewer_title",
    );

    // Show button is disabled until a DTM is loaded.
    await expect(page.locator("#terrain_viewer_show")).toBeDisabled();

    // Close button carries an accessible name for screen readers.
    await expect(page.locator("#terrain_viewer_close"))
      .toHaveAttribute("aria-label", "Close terrain viewer");
  });

  test("prefab inspector dialog opens and closes", async ({ page }) => {
    await page.goto("/index.html");
    const dialog = page.locator("#prefab-inspector-dialog");
    await expect(dialog).toBeAttached();
    await expect(dialog).not.toHaveAttribute("open", /.*/);

    await page.click("#prefab-inspector-show");
    await expect(dialog).toHaveAttribute("open", /.*/);

    await page.click('[data-close-dialog-for="prefab-inspector-dialog"]');
    await expect(dialog).not.toHaveAttribute("open", /.*/);
  });

  test("copy-button activates with Enter key", async ({ page }) => {
    await page.goto("/index.html");
    const button = page.locator(
      'button[data-copy-for="generated_world_path_windows"]',
    );
    await expect(button).toBeVisible();

    // Replace clipboard.writeText with a spy stored on globalThis so the test
    // can assert it was invoked by a keyboard activation.
    await page.evaluate(() => {
      const w = globalThis as unknown as {
        __copyCalls: string[];
      };
      w.__copyCalls = [];
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: (text: string) => {
            w.__copyCalls.push(text);
            return Promise.resolve();
          },
        },
      });
    });

    await button.focus();
    await page.keyboard.press("Enter");

    await expect.poll(async () =>
      await page.evaluate(() =>
        (globalThis as unknown as { __copyCalls?: string[] }).__copyCalls
          ?.length ?? 0
      )
    ).toBeGreaterThan(0);
  });
});
