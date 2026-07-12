/// <reference lib="deno.unstable" />

const PRESERVE_PATTERNS: readonly string[] = [
  "deno-lint-ignore",
  "deno-lint-disable",
  "deno-fmt-ignore",
  "deno-coverage-ignore",
  "@ts-expect-error",
  "@ts-ignore",
  "@ts-nocheck",
  "@ts-check",
  "WHY:",
  "SAFETY:",
  "INVARIANT:",
  "HACK:",
  "TODO",
  "FIXME",
];

/* WHY: gradual rollout ratchet for #225. Entries skip the rule so existing code
   is not audited in one big sweep; shrink to empty, then delete this mechanism.
   Match is POSIX-style substring on the absolute filename. */
const EXCLUDED_PATHS: readonly string[] = [
  "/src/index.ts",
  "/src/index/controller-highlight.ts",
  "/src/index/cursor-coords-display-handler.ts",
  "/src/index/cursor-handler.ts",
  "/src/index/dialog-handler.ts",
  "/src/index/dnd-handler.ts",
  "/src/index/dtm-handler.ts",
  "/src/index/file-handler.ts",
  "/src/index/map-canvas-handler.ts",
  "/src/index/marker-coords-display-handler.ts",
  "/src/index/marker-handler.ts",
  "/src/index/marker-jump-handler.ts",
  "/src/index/marker-store.ts",
  "/src/index/prefab-highlight-handler.ts",
  "/src/index/prefab-inspector-handler.ts",
  "/src/index/prefab-tooltip-handler.ts",
  "/src/index/prefabs-handler.ts",
  "/src/index/reset-display-settings.ts",
  "/src/index/terrain-viewer.ts",
  "/src/index/terrain-viewer/camera-controller.ts",
  "/src/index/terrain-viewer/hover-controller.ts",
  "/src/index/terrain-viewer/marker-sprites.ts",
  "/src/index/terrain-viewer/prefab-boxes.ts",
  "/e2e/index.spec.ts",
  "/e2e/prefabs.spec.ts",
  "/playwright.config.ts",
];

const TRIPLE_SLASH_RE = /^\/\s*<(reference|amd-)/;

export function shouldPreserve(
  comment: { type: string; value: string },
): boolean {
  const raw = comment.value;
  const trimmed = raw.trim();
  if (trimmed === "") return true;
  if (comment.type === "Block" && raw.startsWith("*")) return true;
  if (comment.type === "Line" && TRIPLE_SLASH_RE.test(trimmed)) return true;
  return PRESERVE_PATTERNS.some((p) => raw.includes(p));
}

export function isExcludedFile(
  filename: string,
  excludedPaths: readonly string[] = EXCLUDED_PATHS,
): boolean {
  const normalized = filename.replaceAll("\\", "/");
  return excludedPaths.some((p) => normalized.includes(p));
}

const plugin: Deno.lint.Plugin = {
  name: "local",
  rules: {
    "require-comment-rationale": {
      create(context) {
        if (isExcludedFile(context.filename)) return {};
        return {
          Program() {
            for (const comment of context.sourceCode.getAllComments()) {
              if (shouldPreserve(comment)) continue;
              context.report({
                range: comment.range,
                message:
                  "Delete this comment, or prefix it with a rationale marker (WHY:, SAFETY:, INVARIANT:, HACK:) followed by the reason.",
              });
            }
          },
        };
      },
    },
  },
};

export default plugin;
