# AGENTS.md

This file provides critical instructions for AI agents working on this repository. Agents must read and follow these rules closely.

## Critical Rules

1.  **Never submit a PR without explicit user approval.**
    *   You must ask for permission using `message_user` before calling the `submit` tool.
    *   Even if the plan says "Submit", you must pause and ask for confirmation.

2.  **Atomic Commits & Thought Process.**
    *   **Think before committing:** Before running `git commit`, you must verify `git status` and `git diff --cached --stat`.
    *   **Verify Message vs Content:** Ask yourself: "Does the commit message accurately reflect ALL files in the index?"
        *   If the message says "Refactor code", but the index includes `README.md` or `AGENTS.md`, **STOP**. Unstage the documentation or update the message (or better, split the commit).
    *   **Separation of Concerns:** Strictly separate code logic changes from documentation updates (README, AGENTS.md).
    *   **Formatting:** If `deno fmt` touches many files, commit the formatting changes separately from logic changes if possible. If bundled due to lint requirements, explicitly state which files are formatted vs modified logically in the extended commit message.

3.  **CI Must Pass.**
    *   **Prohibition:** Commits causing Continuous Integration (CI) failures are strictly prohibited.
    *   **Verification:** You MUST run `deno task ci` (or equivalent checks) locally and confirm success before committing.
    *   **Recovery:** If CI fails, do not commit "partial fixes" that still fail. Fix the root cause or revert to a passing state before proceeding.
