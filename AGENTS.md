# AGENTS.md

This file provides critical instructions for AI agents working on this repository. Agents must read and follow these rules closely.

## Critical Rules

1. **Never submit a PR without explicit user approval.**
   - You must ask for permission using `message_user` before calling the `submit` tool.
   - Even if the plan says "Submit", you must pause and ask for confirmation.

2. **Atomic Commits.**
   - Do not bundle unrelated changes into a single commit.
   - Submit changes in logical, atomic units (e.g., "Fix CI workflows", "Add documentation", "Refactor core logic").
   - If you have multiple distinct tasks completed, submit them one by one.

3. **CI Must Pass.**
   - Commits causing Continuous Integration (CI) failures are strictly prohibited.
   - You must verify `deno task ci` passes locally before submitting changes, unless explicitly authorized to submit failing code (e.g., for troubleshooting).
