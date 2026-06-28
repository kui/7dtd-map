import { expect, test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: { type: string; text: string }[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.type() === "warning") {
        errors.push({ type: msg.type(), text: msg.text() });
      }
    });

    page.on("pageerror", (err) => {
      errors.push({ type: "pageerror", text: err.message });
    });

    await use(page);

    expect(
      errors,
      `Unexpected console errors/warnings: ${
        errors.map((e) => `[${e.type}] ${e.text}`).join("; ")
      }`,
    ).toEqual([]);
  },
});
