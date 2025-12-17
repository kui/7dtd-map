# AGENTS.md

This file provides critical instructions for AI agents working on this repository. Agents must read and follow these rules closely.

## Critical Rules

1.  **Never submit a PR without explicit user approval.**
    *   You must ask for permission using `message_user` before calling the `submit` tool.
    *   Even if the plan says "Submit", you must pause and ask for confirmation.

2.  **Atomic Commits & Thought Process.**
    *   **Think before committing:** Before running `git commit`, you must verify `git status` and ask: "Does this commit contain ONLY one logical change?"
    *   **Separation of Concerns:** Do not bundle documentation updates (README, AGENTS.md) with code logic changes unless they are tightly coupled examples.
    *   **Formatting:** If `deno fmt` touches many files, commit the formatting changes separately from logic changes if possible. If not possible (e.g. lint requirements), explain why in the commit message.
    *   If you find yourself with a mixed index that you cannot separate, STOP and ask for help or use `git reset` to retry.

3.  **CI Must Pass.**
    *   Commits causing Continuous Integration (CI) failures are strictly prohibited.
    *   You must verify `deno task ci` passes locally before submitting changes, unless explicitly authorized to submit failing code (e.g., for troubleshooting).
