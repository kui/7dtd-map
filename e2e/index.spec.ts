import { expect } from "@playwright/test";
import { test } from "./fixtures.ts";

test.describe("index.html", () => {
  test("renders the main controls", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page.locator("#map-name")).toBeVisible();
    await expect(page.locator("#prefabs-list")).toBeAttached();
    await expect(page.locator("#min-tier")).toBeVisible();
    await expect(page.locator("#max-tier")).toBeVisible();
    await expect(page.locator("#prefab-filter")).toBeVisible();
    await expect(page.locator("#block-filter")).toBeVisible();
    await expect(page.locator("#label-lang")).toBeVisible();
    await expect(page.locator("#download")).toBeVisible();
  });

  test("language select change is persisted in localStorage", async ({ page }) => {
    await page.goto("/index.html");
    // The label-lang select is populated asynchronously by LabelHandler; wait
    // for at least one extra option to appear beyond the default.
    await expect
      .poll(async () => await page.locator("#label-lang option").count())
      .toBeGreaterThan(1);

    await page.selectOption("#label-lang", "japanese");
    await expect
      .poll(async () =>
        await page.evaluate(() => localStorage.getItem("language"))
      )
      .toBe("japanese");
  });

  test("min-tier cannot exceed max-tier — they correct each other", async ({ page }) => {
    await page.goto("/index.html");
    // Set min above current max; min-max-inputs.ts should drag max up so
    // max >= min.
    await page.locator("#max-tier").evaluate((el: HTMLInputElement) => {
      el.value = "2";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("#min-tier").evaluate((el: HTMLInputElement) => {
      el.value = "4";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const maxValue = await page.locator("#max-tier").inputValue();
    expect(Number(maxValue)).toBeGreaterThanOrEqual(4);
  });

  test("loading and filtering the bundled Navezgane map", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/index.html");

    // Wait for the bundled-map select to be populated.
    await expect
      .poll(async () =>
        await page.locator("#bundled-map-select option").count()
      )
      .toBeGreaterThan(1);

    // Install an observer that latches when the load/processing dialog opens
    // and when it subsequently closes. The dialog is opened via showModal()
    // and closed once processing finishes; using the close transition as the
    // "processing done" signal avoids polling canvas dimensions before the
    // worker has resized the canvas.
    await page.evaluate(() => {
      const w = globalThis as unknown as {
        __dialogWasOpen?: boolean;
        __dialogClosed?: boolean;
      };
      w.__dialogWasOpen = false;
      w.__dialogClosed = false;
      const dialog = document.getElementById("dialog") as HTMLDialogElement;
      new MutationObserver(() => {
        if (dialog.open) w.__dialogWasOpen = true;
        else if (w.__dialogWasOpen) w.__dialogClosed = true;
      }).observe(dialog, { attributes: true, attributeFilter: ["open"] });
    });

    await page.selectOption("#bundled-map-select", "Navezgane");

    // Loading dialog should have been open at some point during processing.
    await expect
      .poll(async () =>
        await page.evaluate(() =>
          (globalThis as unknown as { __dialogWasOpen?: boolean })
            .__dialogWasOpen ?? false
        )
      )
      .toBe(true);

    // Wait for the dialog to close, signalling processing finished. Cold
    // workers under parallel test load can take tens of seconds, so allow a
    // generous window before checking canvas dimensions.
    await expect
      .poll(
        async () =>
          await page.evaluate(() =>
            (globalThis as unknown as { __dialogClosed?: boolean })
              .__dialogClosed ?? false
          ),
        { timeout: 40_000 },
      )
      .toBe(true);

    // Canvas dimensions: Navezgane HeightMapSize is 6144x6144 and the default
    // render scale is 0.12 -> 6144 * 0.12 = 737.28 -> 737.
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
      async () => await page.locator("#prefabs-list li").count(),
      slow,
    ).toBeGreaterThan(0);

    // Map name input reflects the selection.
    await expect.poll(
      async () => await page.locator("#map-name").inputValue(),
      slow,
    ).toBe("Navezgane");

    // Apply the "trader" prefab-filter preset.
    await page.click(
      'button[data-input-prefab-filter="trader"]:text-is("All Traders")',
    );
    await expect.poll(async () =>
      await page.locator("#prefab-filter").inputValue()
    ).toBe("trader");
    await expect.poll(async () =>
      await page.locator("#prefabs-list li").count()
    ).toBeGreaterThan(0);

    // Clear the prefab filter via its X button (data-input-prefab-filter="").
    await page.click(
      'button[data-input-prefab-filter=""]',
    );
    await expect.poll(async () =>
      await page.locator("#prefab-filter").inputValue()
    ).toBe("");

    // Apply the "Super Corn" block-filter preset.
    await page.click(
      'button[data-input-block-filter="(Grace|Super)Corn"]:text-is("Super Corn")',
    );
    await expect.poll(async () =>
      await page.locator("#block-filter").inputValue()
    ).toBe("(Grace|Super)Corn");
    await expect.poll(async () =>
      await page.locator("#prefabs-list li").count()
    ).toBeGreaterThan(0);

    // Narrow the tier range to [0, 0]; with Super Corn still in the block
    // filter, no prefab should match.
    await page.locator("#max-tier").evaluate((el: HTMLInputElement) => {
      el.value = "0";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.locator("#min-tier").evaluate((el: HTMLInputElement) => {
      el.value = "0";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect.poll(async () =>
      await page.locator("#prefabs-list li").count()
    ).toBe(0);
  });

  test("block filter input stays responsive (freeze regression)", async ({ page }) => {
    test.setTimeout(60_000);

    // Collect long tasks with their start times so we can look only at the
    // window around typing, ignoring long tasks from the initial map load.
    await page.addInitScript(() => {
      const w = globalThis as unknown as {
        __longtasks?: { start: number; duration: number }[];
      };
      w.__longtasks = [];
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          w.__longtasks?.push({ start: e.startTime, duration: e.duration });
        }
      }).observe({ type: "longtask", buffered: true });
    });

    await page.goto("/index.html");
    await expect
      .poll(async () =>
        await page.locator("#bundled-map-select option").count()
      )
      .toBeGreaterThan(1);

    await page.evaluate(() => {
      const w = globalThis as unknown as {
        __dialogWasOpen?: boolean;
        __dialogClosed?: boolean;
      };
      w.__dialogWasOpen = false;
      w.__dialogClosed = false;
      const dialog = document.getElementById("dialog") as HTMLDialogElement;
      new MutationObserver(() => {
        if (dialog.open) w.__dialogWasOpen = true;
        else if (w.__dialogWasOpen) w.__dialogClosed = true;
      }).observe(dialog, { attributes: true, attributeFilter: ["open"] });
    });
    await page.selectOption("#bundled-map-select", "Navezgane");
    await expect
      .poll(
        async () =>
          await page.evaluate(() =>
            (globalThis as unknown as { __dialogClosed?: boolean })
              .__dialogClosed ?? false
          ),
        { timeout: 40_000 },
      )
      .toBe(true);
    await expect
      .poll(async () => await page.locator("#prefabs-list li").count(), {
        timeout: 20_000,
      })
      .toBeGreaterThan(0);

    const typingStart = await page.evaluate(() => performance.now());
    for (const ch of "stump") {
      await page.locator("#block-filter").press(ch);
      await page.waitForTimeout(230);
    }
    await page.waitForTimeout(2500);

    const durations = await page.evaluate((start) => {
      const w = globalThis as unknown as {
        __longtasks?: { start: number; duration: number }[];
      };
      return (w.__longtasks ?? [])
        .filter((t) => t.start >= start)
        .map((t) => t.duration);
    }, typingStart);
    const maxSingle = durations.length ? Math.max(...durations) : 0;
    const total = durations.reduce((a, b) => a + b, 0);
    // Thresholds are loose vs the pre-fix baseline (single 1,864ms / total
    // 5,100ms) to tolerate CI speed variance; prefer retries over loosening.
    expect(maxSingle).toBeLessThan(500);
    expect(total).toBeLessThan(1500);

    await expect(page.locator("#block-filter")).toHaveValue("stump");
    await expect
      .poll(async () => await page.locator("#prefabs-list > li").count())
      .toBeGreaterThan(0);
    await expect(
      page.locator("#prefabs-list li", { hasText: "treeStumpPOI" }).first(),
    ).toBeAttached();
  });

  test("terrain viewer dialog is wired up with a11y attributes", async ({ page }) => {
    await page.goto("/index.html");
    const dialog = page.locator("#terrain-viewer-dialog");
    await expect(dialog).toBeAttached();
    await expect(dialog).not.toHaveAttribute("open", /.*/);
    await expect(dialog).toHaveAttribute(
      "aria-labelledby",
      "terrain-viewer-title",
    );

    // Show button is disabled until a DTM is loaded.
    await expect(page.locator("#terrain-viewer-show")).toBeDisabled();

    // Close button carries an accessible name for screen readers.
    await expect(page.locator("#terrain-viewer-close"))
      .toHaveAttribute("aria-label", "Close terrain viewer");
  });

  test("prefab inspector dialog opens and closes", async ({ page }) => {
    await page.goto("/index.html");
    const dialog = page.locator("#prefab-inspector-dialog");
    await expect(dialog).toBeAttached();
    await expect(dialog).not.toHaveAttribute("open", /.*/);

    await page.click("#prefab-inspector-show");
    await expect(dialog).toHaveAttribute("open", /.*/);

    await page.click("#prefab-inspector-close");
    await expect(dialog).not.toHaveAttribute("open", /.*/);
  });

  test("copy-button activates with Enter key", async ({ page }) => {
    await page.goto("/index.html");
    const button = page.locator(
      'button[data-copy-for="generated-world-path-windows"]',
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
