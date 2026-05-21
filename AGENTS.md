# AGENTS.md

This file provides critical instructions for AI agents working on this
repository. Agents must read and follow these rules closely.

## Critical Rules

1. **Explicit Approval & Planning**
   - **Never submit a PR or push changes without explicit user approval.**
   - **Strict Step Separation:** You must plan `git commit`, `git push`, and
     `PR creation` as distinct, separate steps. Do not bundle them into a single
     "Submit" action in your plan.
   - You must pause and ask for confirmation before the final push/PR step.

2. **Atomic Commits & Scope**
   - **One Logical Change per Commit:** Do not bundle unrelated changes.
   - **Separation of Concerns:**
     - **Formatting:** Avoid bundling "drive-by" formatting of unrelated files.
       If you must run a global formatter, do it in a distinct commit.
   - **Verify Commit Message:** Ensure the message accurately describes
     _everything_ in the commit. If the message says "Fix bug" but the index
     includes `AGENTS.md`, split the commit.

3. **CI & Verification**
   - **Green CI Required:** Commits that break CI are prohibited.
   - **Run Checks Locally:** You MUST run `deno task ci` and confirm success
     before committing.
   - **No Partial Fixes:** Do not commit broken code hoping to fix it later.
