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

const TRIPLE_SLASH_RE = /^\/\s*<(reference|amd-)/;

function shouldPreserve(
  comment: { type: string; value: string },
): boolean {
  const raw = comment.value;
  const trimmed = raw.trim();
  if (trimmed === "") return true;
  if (comment.type === "Block" && raw.startsWith("*")) return true;
  if (comment.type === "Line" && TRIPLE_SLASH_RE.test(trimmed)) return true;
  return PRESERVE_PATTERNS.some((p) => raw.includes(p));
}

const plugin: Deno.lint.Plugin = {
  name: "local",
  rules: {
    "require-comment-rationale": {
      create(context) {
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
